package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/sandaru-fx/SentinelChild-System/backend/models"
)

// ListAdmins returns all authorized personnel.
func ListAdmins(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := adminCollection(client)
		var out []models.Admin = make([]models.Admin, 0)
		cur, err := col.Find(context.Background(), bson.M{})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		cur.All(context.Background(), &out)
		json.NewEncoder(w).Encode(out)
	}
}

// CreateAdmin registers a new team member.
func CreateAdmin(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user models.Admin
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if user.Password == "" {
			user.Password = "admin123" // Default for new enrollments
		}

		col := adminCollection(client)
		res, err := col.InsertOne(context.Background(), user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		user.ID = res.InsertedID.(primitive.ObjectID)
		json.NewEncoder(w).Encode(user)
	}
}

// UpdateAdmin updates profile details.
func UpdateAdmin(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		objID, _ := primitive.ObjectIDFromHex(id)

		var updates map[string]interface{}
		json.NewDecoder(r.Body).Decode(&updates)

		col := adminCollection(client)
		_, err := col.UpdateByID(context.Background(), objID, bson.M{"$set": updates})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

// DeleteAdmin removes access for a user.
func DeleteAdmin(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		objID, _ := primitive.ObjectIDFromHex(id)

		col := adminCollection(client)
		_, err := col.DeleteOne(context.Background(), bson.M{"_id": objID})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

// GetAuditLogs returns system activity (Simplified for demo).
func GetAuditLogs(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logs := []map[string]interface{}{
			{
				"id":        "l1",
				"action":    "System Authentication",
				"details":   "Secure terminal session established",
				"reportId":  "N/A",
				"timestamp": time.Now().Add(-2 * time.Hour),
			},
			{
				"id":        "l2",
				"action":    "Database Sync",
				"details":   "Master report index synchronized",
				"reportId":  "CH-102933",
				"timestamp": time.Now().Add(-5 * time.Hour),
			},
		}
		json.NewEncoder(w).Encode(logs)
	}
}
