package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Reporter represents the person filing the report.
type Reporter struct {
	Name  string `bson:"name,omitempty" json:"name,omitempty"`
	Phone string `bson:"phone,omitempty" json:"phone,omitempty"`
}

// Location represents the geographic coordinates (optional for demo).
type Location struct {
	Lat float64 `bson:"lat,omitempty" json:"lat,omitempty"`
	Lng float64 `bson:"lng,omitempty" json:"lng,omitempty"`
}

// StatusUpdate represents a state change in the report workflow.
type StatusUpdate struct {
	Status    string    `bson:"status" json:"status"`
	Officer   string    `bson:"officer" json:"officer"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	Note      string    `bson:"note" json:"note"`
}

// InternalNote represents private communications between officers.
type InternalNote struct {
	Author    string    `bson:"author" json:"author"`
	Text      string    `bson:"text" json:"text"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

// Report represents an incident report stored in MongoDB.
type Report struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ChildName     string             `bson:"childName,omitempty" json:"childName,omitempty"`
	Age           string             `bson:"age,omitempty" json:"age,omitempty"`
	Description   string             `bson:"description" json:"description"`
	Location      *Location          `bson:"location,omitempty" json:"location,omitempty"`
	Reporter      *Reporter          `bson:"reporter,omitempty" json:"reporter,omitempty"`
	Evidence      []string           `bson:"evidence,omitempty" json:"evidence,omitempty"`
	Status        string             `bson:"status" json:"status"`
	Priority      string             `bson:"priority,omitempty" json:"priority,omitempty"`
	AdminNotes    string             `bson:"adminNotes,omitempty" json:"adminNotes,omitempty"`
	History       []StatusUpdate     `bson:"history,omitempty" json:"history,omitempty"`
	InternalNotes []InternalNote     `bson:"internalNotes,omitempty" json:"internalNotes,omitempty"`
	CreatedAt     time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updatedAt" json:"updatedAt"`
}
