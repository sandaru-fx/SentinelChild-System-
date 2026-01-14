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
)

func resourceCollection(client *mongo.Client) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	return db.GetCollection(client, dbName, "resources")
}

func GetResources(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		collection := resourceCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		lang := r.URL.Query().Get("lang")
		filter := bson.M{}
		if lang != "" {
			filter["language"] = lang
		}

		cursor, err := collection.Find(ctx, filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var resources []models.Resource = make([]models.Resource, 0)
		if err = cursor.All(ctx, &resources); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(resources)
	}
}

func CreateResource(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var resource models.Resource
		if err := json.NewDecoder(r.Body).Decode(&resource); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		resource.ID = primitive.NewObjectID()
		resource.CreatedAt = time.Now()
		resource.UpdatedAt = time.Now()

		collection := resourceCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := collection.InsertOne(ctx, resource)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(resource)
	}
}

func UpdateResource(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := primitive.ObjectIDFromHex(params["id"])
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		var resource models.Resource
		if err := json.NewDecoder(r.Body).Decode(&resource); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		resource.UpdatedAt = time.Now()

		collection := resourceCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{
			"$set": bson.M{
				"title":       resource.Title,
				"description": resource.Description,
				"type":        resource.Type,
				"icon":        resource.Icon,
				"readTime":    resource.ReadTime,
				"content":     resource.Content,
				"link":        resource.Link,
				"category":    resource.Category,
				"language":    resource.Language,
				"updatedAt":   resource.UpdatedAt,
			},
		}

		_, err = collection.UpdateOne(ctx, bson.M{"_id": id}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(resource)
	}
}

func DeleteResource(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := primitive.ObjectIDFromHex(params["id"])
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		collection := resourceCollection(client)
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
