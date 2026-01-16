package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ResourceType string

const (
	ResourceTypeArticle ResourceType = "ARTICLE"
	ResourceTypeVideo   ResourceType = "VIDEO"
	ResourceTypeGuide   ResourceType = "GUIDE"
	ResourceTypeFAQ     ResourceType = "FAQ"
)

type Resource struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Type        ResourceType       `bson:"type" json:"type"`
	Icon        string             `bson:"icon" json:"icon"`
	ReadTime    string             `bson:"readTime" json:"readTime"`
	Content     string             `bson:"content" json:"content"`
	Link        string             `bson:"link,omitempty" json:"link,omitempty"`
	Category    string             `bson:"category" json:"category"`
	Language    string             `bson:"language" json:"language"` // en, si, ta
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}
