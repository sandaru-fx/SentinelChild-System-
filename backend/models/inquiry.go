package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Inquiry struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type          string             `bson:"type" json:"type"` // "voice" or "general"
	Name          string             `bson:"name,omitempty" json:"name,omitempty"`
	Email         string             `bson:"email,omitempty" json:"email,omitempty"`
	Department    string             `bson:"department,omitempty" json:"department,omitempty"`
	Message       string             `bson:"message,omitempty" json:"message,omitempty"` // For general inquiries
	Transcription string             `bson:"transcription" json:"transcription"`         // For voice
	AudioURL      string             `bson:"audio_url,omitempty" json:"audio_url,omitempty"`
	IsVoice       bool               `bson:"is_voice" json:"is_voice"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	Status        string             `bson:"status" json:"status"` // "pending", "reviewed"
}
