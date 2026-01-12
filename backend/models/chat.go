package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ChatMessage represents a single message in a session.
type ChatMessage struct {
	ID         string    `bson:"id" json:"id"`
	SenderID   string    `bson:"senderId" json:"senderId"`
	SenderName string    `bson:"senderName" json:"senderName"`
	Text       string    `bson:"text" json:"text"`
	Timestamp  time.Time `bson:"timestamp" json:"timestamp"`
	IsEdited   bool      `bson:"isEdited,omitempty" json:"isEdited,omitempty"`
}

// ChatSession represents a support conversation.
type ChatSession struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	SessionID   string             `bson:"sessionId" json:"sessionId"`
	UserID      string             `bson:"userId" json:"userId"`
	UserPhone   string             `bson:"userPhone" json:"userPhone"`
	UserName    string             `bson:"userName" json:"userName"`
	Messages    []ChatMessage      `bson:"messages" json:"messages"`
	Status      string             `bson:"status" json:"status"`
	UnreadCount int                `bson:"unreadCount" json:"unreadCount"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}
