package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuditLog struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AdminID   string             `bson:"adminId" json:"adminId"`
	AdminName string             `bson:"adminName" json:"adminName"`
	Action    string             `bson:"action" json:"action"`                         // VIEW, UPDATE, DELETE, LOGIN
	TargetID  string             `bson:"targetId,omitempty" json:"targetId,omitempty"` // ID of the report or user
	Details   string             `bson:"details,omitempty" json:"details,omitempty"`
	Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
}
