package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Inquiry struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Transcription string             `bson:"transcription" json:"transcription"`
	AudioURL      string             `bson:"audio_url" json:"audio_url"` // Path to the file
	IsVoice       bool               `bson:"is_voice" json:"is_voice"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	Status        string             `bson:"status" json:"status"` // "pending", "reviewed"
}
