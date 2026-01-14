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
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func settingsCollection(client *mongo.Client) *mongo.Collection {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}
	return db.GetCollection(client, dbName, "settings")
}

func GetSetting(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		key := params["key"]
		lang := r.URL.Query().Get("lang")
		if lang == "" {
			lang = "en"
		}

		collection := settingsCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var setting models.Setting
		err := collection.FindOne(ctx, bson.M{"key": key, "language": lang}).Decode(&setting)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				// Return default empty setting instead of error
				json.NewEncoder(w).Encode(models.Setting{Key: key, Language: lang, Value: ""})
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(setting)
	}
}

func UpdateSetting(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		key := params["key"]

		var input struct {
			Value    string `json:"value"`
			Language string `json:"language"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if input.Language == "" {
			input.Language = "en"
		}

		collection := settingsCollection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{
			"$set": bson.M{
				"value":     input.Value,
				"updatedAt": time.Now(),
			},
		}

		opts := options.Update().SetUpsert(true)
		_, err := collection.UpdateOne(ctx, bson.M{"key": key, "language": input.Language}, update, opts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(bson.M{"success": true})
	}
}
