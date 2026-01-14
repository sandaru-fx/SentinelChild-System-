package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Hotline struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Number      string             `bson:"number" json:"number"`
	Description string             `bson:"description" json:"description"`
	Icon        string             `bson:"icon" json:"icon"`
	Category    string             `bson:"category" json:"category"`
	Language    string             `bson:"language" json:"language"` // en, si, ta
	Priority    int                `bson:"priority" json:"priority"` // For sorting
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}
