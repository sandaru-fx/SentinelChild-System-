package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Setting struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Key       string             `bson:"key" json:"key"`           // e.g., "privacy_policy"
	Value     string             `bson:"value" json:"value"`       // Markdown or plain text
	Language  string             `bson:"language" json:"language"` // en, si, ta
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
