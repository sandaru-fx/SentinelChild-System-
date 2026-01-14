package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func hotlineCollection(client *mongo.Client) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	return db.GetCollection(client, dbName, "hotlines")
}

func GetHotlines(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		collection := hotlineCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		lang := r.URL.Query().Get("lang")
		filter := bson.M{}
		if lang != "" {
			filter["language"] = lang
		}

		// Sort by priority (ascending) and then name
		findOptions := options.Find()
		findOptions.SetSort(bson.D{{Key: "priority", Value: 1}, {Key: "name", Value: 1}})

		cursor, err := collection.Find(ctx, filter, findOptions)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var hotlines []models.Hotline = make([]models.Hotline, 0)
		if err = cursor.All(ctx, &hotlines); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(hotlines)
	}
}

func CreateHotline(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var hotline models.Hotline
		if err := json.NewDecoder(r.Body).Decode(&hotline); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		hotline.ID = primitive.NewObjectID()
		hotline.CreatedAt = time.Now()
		hotline.UpdatedAt = time.Now()

		collection := hotlineCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := collection.InsertOne(ctx, hotline)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(hotline)
	}
}

func UpdateHotline(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := primitive.ObjectIDFromHex(params["id"])
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		var hotline models.Hotline
		if err := json.NewDecoder(r.Body).Decode(&hotline); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		hotline.UpdatedAt = time.Now()

		collection := hotlineCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{
			"$set": bson.M{
				"name":        hotline.Name,
				"number":      hotline.Number,
				"description": hotline.Description,
				"icon":        hotline.Icon,
				"category":    hotline.Category,
				"language":    hotline.Language,
				"priority":    hotline.Priority,
				"updatedAt":   hotline.UpdatedAt,
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": id}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(hotline)
	}
}

func DeleteHotline(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := primitive.ObjectIDFromHex(params["id"])
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		collection := hotlineCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err = collection.DeleteOne(ctx, bson.M{"_id": id})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
