package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"
)

func chatCollection(client *mongo.Client) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	return db.GetCollection(client, dbName, "chats")
}

// StartChatSession initializes or retrieves a chat session.
func StartChatSession(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UserID    string `json:"userId"`
			UserPhone string `json:"userPhone"`
			UserName  string `json:"userName"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		col := chatCollection(client)
		var session models.ChatSession

		// Try to find active session for this user by unique sessionId (UUID)
		err := col.FindOne(context.Background(), bson.M{
			"sessionId": req.UserID, // Note: UserID from frontend is used as sessionId here
			"status":    "ACTIVE",
		}).Decode(&session)

		if err == mongo.ErrNoDocuments {
			// Get IP for blocking logic
			ip, _, _ := net.SplitHostPort(r.RemoteAddr)

			// Create new session
			now := time.Now()
			session = models.ChatSession{
				SessionID:   req.UserID, // Use the UUID provided by frontend
				UserID:      req.UserID,
				UserPhone:   req.UserPhone,
				UserName:    req.UserName,
				IP:          ip,
				Messages:    []models.ChatMessage{},
				Status:      "ACTIVE",
				UnreadCount: 0,
				CreatedAt:   now,
				UpdatedAt:   now,
			}

			// Automated Greeting
			greeting := models.ChatMessage{
				ID:         fmt.Sprintf("BOT-%d", now.Unix()),
				SenderID:   "bot",
				SenderName: "CHARS Comfort Bot",
				Text:       fmt.Sprintf("Hela-suwa machan %s. Breathe normally. You are in a safe space now. Api okkoma ekathu wela oyawa safe karagamu. Tell me what happened when you are ready. I am here to listen.", req.UserName),
				Timestamp:  now,
				Status:     "DELIVERED",
			}
			session.Messages = append(session.Messages, greeting)

			_, err := col.InsertOne(context.Background(), session)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		json.NewEncoder(w).Encode(session)
	}
}

// ListChatSessions returns all sessions for admin.
func ListChatSessions(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := chatCollection(client)
		opts := options.Find().SetSort(bson.M{"updatedAt": -1})
		cur, err := col.Find(context.Background(), bson.M{}, opts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var sessions []models.ChatSession = make([]models.ChatSession, 0)
		cur.All(context.Background(), &sessions)
		json.NewEncoder(w).Encode(sessions)
	}
}

// SendMessage appends a message to a session.
func SendMessage(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		sessionID := vars["id"]

		var msg models.ChatMessage
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		msg.Timestamp = time.Now()
		if msg.ID == "" {
			msg.ID = fmt.Sprintf("MSG-%d", msg.Timestamp.Unix())
		}

		col := chatCollection(client)
		update := bson.M{
			"$push": bson.M{"messages": msg},
			"$set":  bson.M{"updatedAt": msg.Timestamp},
		}

		if msg.SenderID == "user" {
			update["$inc"] = bson.M{"unreadCount": 1}

			// Automated Connection logic
			lowerText := strings.ToLower(msg.Text)
			if strings.Contains(lowerText, "yes") || strings.Contains(lowerText, "connect") || strings.Contains(lowerText, "please") {
				autoReply := models.ChatMessage{
					ID:         fmt.Sprintf("BOT-R-%d", time.Now().Unix()),
					SenderID:   "bot",
					SenderName: "CHARS AI",
					Text:       "Connecting you to the Duty Officer now. Please remain on the line.",
					Timestamp:  time.Now().Add(time.Second),
				}
				update["$push"] = bson.D{
					{"messages", bson.D{{"$each", []models.ChatMessage{msg, autoReply}}}},
				}
				// Note: Using $each with $push to add both user msg and auto reply
				// Adjusting update map for this specific case
				delete(update, "$push") // Remove the simple push
				update["$push"] = bson.M{
					"messages": bson.M{"$each": []models.ChatMessage{msg, autoReply}},
				}
			}
		}

		_, err := col.UpdateOne(context.Background(), bson.M{"sessionId": sessionID}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(msg)
	}
}

// MarkChatRead resets unread count.
func MarkChatRead(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionID := mux.Vars(r)["id"]
		col := chatCollection(client)
		_, err := col.UpdateOne(context.Background(),
			bson.M{"sessionId": sessionID},
			bson.M{"$set": bson.M{"unreadCount": 0}})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
