package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"
)

func collection(client *mongo.Client) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	return db.GetCollection(client, dbName, "reports")
}

// CreateReport returns a handler which inserts a new report.
func CreateReport(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.Report
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		now := time.Now()
		req.CreatedAt = now
		req.UpdatedAt = now
		col := collection(client)
		res, err := col.InsertOne(context.Background(), req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]interface{}{"insertedId": res.InsertedID})
	}
}

// ListReports returns a handler which lists reports.
func ListReports(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := collection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		cur, err := col.Find(ctx, bson.M{})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cur.Close(ctx)
		var out []models.Report
		if err := cur.All(ctx, &out); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(out)
	}
}

// GetReport returns a handler which fetches a single report by id.
func GetReport(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		col := collection(client)
		var out models.Report
		if err := col.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&out); err != nil {
			if err == mongo.ErrNoDocuments {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(out)
	}
}

// UpdateReport updates a report.
func UpdateReport(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		var req models.Report
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		req.UpdatedAt = time.Now()
		col := collection(client)
		update := bson.M{"$set": req}
		res, err := col.UpdateByID(context.Background(), objID, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(res)
	}
}

// DeleteReport deletes a report by id.
func DeleteReport(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}
		col := collection(client)
		res, err := col.DeleteOne(context.Background(), bson.M{"_id": objID})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(res)
	}
}
