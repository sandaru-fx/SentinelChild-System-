package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"chars/backend/db"
	"chars/backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func auditCollection(client *mongo.Client) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	return db.GetCollection(client, dbName, "audit_logs")
}

// LogActivity is a helper to record admin actions.
func LogActivity(client *mongo.Client, adminID, adminName, action, targetID, details string) {
	col := auditCollection(client)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log := models.AuditLog{
		AdminID:   adminID,
		AdminName: adminName,
		Action:    action,
		TargetID:  targetID,
		Details:   details,
		Timestamp: time.Now(),
	}

	_, _ = col.InsertOne(ctx, log)
}

// GetAuditLogs returns the history of administrative actions.
func GetAuditLogs(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := auditCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		filter := bson.M{}
		targetID := r.URL.Query().Get("targetId")
		if targetID != "" {
			filter["targetId"] = targetID
		}

		cursor, err := col.Find(ctx, filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var logs []models.AuditLog = make([]models.AuditLog, 0)
		if err := cursor.All(ctx, &logs); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(logs)
	}
}
