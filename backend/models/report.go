package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Report represents an incident report stored in MongoDB.
type Report struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ReporterName string             `bson:"reporterName" json:"reporterName"`
	Contact      string             `bson:"contact,omitempty" json:"contact,omitempty"`
	IncidentDate time.Time          `bson:"incidentDate,omitempty" json:"incidentDate,omitempty"`
	Location     string             `bson:"location,omitempty" json:"location,omitempty"`
	Description  string             `bson:"description,omitempty" json:"description,omitempty"`
	Status       string             `bson:"status,omitempty" json:"status,omitempty"`
	CreatedAt    time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt    time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
