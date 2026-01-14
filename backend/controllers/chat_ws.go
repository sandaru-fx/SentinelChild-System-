package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // In production, specify exact origins
	},
}

// WSMessage represents a generic message structure for WebSockets
type WSMessage struct {
	Type      string      `json:"type"`
	SessionID string      `json:"sessionId,omitempty"`
	Payload   interface{} `json:"payload"`
}

// Client represents a connected user or admin
type Client struct {
	Hub       *Hub
	Conn      *websocket.Conn
	Send      chan []byte
	ID        string
	Role      string // "user" or "admin"
	SessionID string // For users
}

// Hub manages all connected clients and broadcasts messages
type Hub struct {
	UserClients  map[string]*Client // SessionID -> Client
	AdminClients map[string]*Client // AdminID -> Client
	Broadcast    chan []byte
	Register     chan *Client
	Unregister   chan *Client
	MongoClient  *mongo.Client
	Mu           sync.Mutex
}

func NewHub(client *mongo.Client) *Hub {
	return &Hub{
		Broadcast:    make(chan []byte),
		Register:     make(chan *Client),
		Unregister:   make(chan *Client),
		UserClients:  make(map[string]*Client),
		AdminClients: make(map[string]*Client),
		MongoClient:  client,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mu.Lock()
			if client.Role == "admin" {
				h.AdminClients[client.ID] = client
				log.Printf("Admin registered: %s", client.ID)
			} else {
				h.UserClients[client.SessionID] = client
				log.Printf("User registered: %s", client.SessionID)
				// Notify admins about new user in queue (if needed)
				h.notifyQueueUpdate()
			}
			h.Mu.Unlock()

		case client := <-h.Unregister:
			h.Mu.Lock()
			if client.Role == "admin" {
				delete(h.AdminClients, client.ID)
			} else {
				delete(h.UserClients, client.SessionID)
			}
			close(client.Send)
			h.Mu.Unlock()

		case message := <-h.Broadcast:
			// Custom broadcast logic can go here
			// For now, simple broadcast to all admins might be used for queue updates
			var wsMsg WSMessage
			if err := json.Unmarshal(message, &wsMsg); err == nil {
				if wsMsg.Type == "chat" {
					// Handle routing chat message
					h.routeChatMessage(wsMsg, message)
				}
			}
		}
	}
}

func (h *Hub) notifyQueueUpdate() {
	// Send list of active sessions to all admins
	sessions := h.getActiveSessions()
	data, _ := json.Marshal(WSMessage{
		Type:    "queue_update",
		Payload: sessions,
	})
	for _, admin := range h.AdminClients {
		admin.Send <- data
	}
}

func (h *Hub) getActiveSessions() []models.ChatSession {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	col := h.MongoClient.Database(dbName).Collection("chats")
	cur, err := col.Find(context.Background(), bson.M{"status": "ACTIVE"})
	if err != nil {
		log.Printf("❌ Error fetching active sessions: %v", err)
		return nil
	}
	var sessions []models.ChatSession = make([]models.ChatSession, 0)
	cur.All(context.Background(), &sessions)
	log.Printf("📊 Found %d active sessions for queue update", len(sessions))
	return sessions
}

func (h *Hub) routeChatMessage(wsMsg WSMessage, raw []byte) {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	// Broadcast to user if they are online
	if user, ok := h.UserClients[wsMsg.SessionID]; ok {
		user.Send <- raw
	}

	// Broadcast to all admins
	for _, admin := range h.AdminClients {
		admin.Send <- raw
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var wsMsg WSMessage
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			continue
		}

		// Process based on type
		if wsMsg.Type == "chat" {
			c.Hub.handleIncomingChat(c, wsMsg)
		} else if wsMsg.Type == "seen" {
			c.Hub.handleSeenEvent(c, wsMsg)
		}
	}
}

func (c *Client) WritePump() {
	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.Conn.WriteMessage(websocket.TextMessage, message)
		}
	}
}

func (h *Hub) handleIncomingChat(sender *Client, wsMsg WSMessage) {
	payloadBytes, _ := json.Marshal(wsMsg.Payload)
	var chatMsg models.ChatMessage
	json.Unmarshal(payloadBytes, &chatMsg)

	chatMsg.Timestamp = time.Now()
	if chatMsg.ID == "" {
		chatMsg.ID = fmt.Sprintf("MSG-%d", chatMsg.Timestamp.UnixNano())
	}
	chatMsg.Status = "DELIVERED"

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	col := h.MongoClient.Database(dbName).Collection("chats")
	_, err := col.UpdateOne(context.Background(),
		bson.M{"sessionId": wsMsg.SessionID},
		bson.M{"$push": bson.M{"messages": chatMsg}, "$set": bson.M{"updatedAt": chatMsg.Timestamp}})

	if err != nil {
		log.Printf("❌ Error saving message: %v", err)
		return
	}
	log.Printf("✅ Message saved to DB for Session: %s", wsMsg.SessionID)

	// Broadcast to relevant parties
	data, _ := json.Marshal(WSMessage{
		Type:      "chat",
		SessionID: wsMsg.SessionID,
		Payload:   chatMsg,
	})

	h.Mu.Lock()
	defer h.Mu.Unlock()

	log.Printf("📢 Broadcasting chat to User: %s and %d Admins", wsMsg.SessionID, len(h.AdminClients))

	if user, ok := h.UserClients[wsMsg.SessionID]; ok {
		user.Send <- data
	}

	for id, admin := range h.AdminClients {
		if sender != admin {
			log.Printf("📤 Sending to Admin [ID: %s]", id)
			admin.Send <- data
		}
	}
}

func (h *Hub) handleSeenEvent(sender *Client, wsMsg WSMessage) {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	col := h.MongoClient.Database(dbName).Collection("chats")

	// Update all unread messages from 'user' to 'SEEN'
	_, err := col.UpdateOne(context.Background(),
		bson.M{"sessionId": wsMsg.SessionID},
		bson.M{
			"$set": bson.M{
				"messages.$[msg].status": "SEEN",
				"unreadCount":            0,
			},
		},
		options.Update().SetArrayFilters(options.ArrayFilters{
			Filters: []interface{}{
				bson.M{"msg.senderId": "user", "msg.status": bson.M{"$ne": "SEEN"}},
			},
		}),
	)

	if err != nil {
		log.Printf("❌ Error updating seen status: %v", err)
		return
	}

	// Broadcast back to user so they see blue ticks
	data, _ := json.Marshal(WSMessage{
		Type:      "seen",
		SessionID: wsMsg.SessionID,
	})

	h.Mu.Lock()
	if user, ok := h.UserClients[wsMsg.SessionID]; ok {
		user.Send <- data
	}
	h.Mu.Unlock()
}

func IsIPBlocked(client *mongo.Client, ip string) bool {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	col := client.Database(dbName).Collection("ip_blacklist")
	count, err := col.CountDocuments(context.Background(), bson.M{"ip": ip})
	if err != nil {
		return false
	}
	return count > 0
}

// HandleWS handles websocket requests from clients
func HandleWS(hub *Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get IP for blocking logic
		ip, _, _ := net.SplitHostPort(r.RemoteAddr)

		if IsIPBlocked(hub.MongoClient, ip) {
			log.Printf("🚫 Blocked connection attempt from IP: %s", ip)
			http.Error(w, "Access Denied", http.StatusForbidden)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("Upgrade error: %v", err)
			return
		}

		role := r.URL.Query().Get("role") // "user" or "admin"
		id := r.URL.Query().Get("id")     // AdminID or UserID
		sessionID := r.URL.Query().Get("sessionId")

		client := &Client{
			Hub:       hub,
			Conn:      conn,
			Send:      make(chan []byte, 256),
			ID:        id,
			Role:      role,
			SessionID: sessionID,
		}

		client.Hub.Register <- client

		go client.WritePump()
		go client.ReadPump()
	}
}
