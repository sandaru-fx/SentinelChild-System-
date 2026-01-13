package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateInquiry handles voice/text inquiry submission
func CreateInquiry(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse multipart form (max 10MB)
		r.ParseMultipartForm(10 << 20)

		transcription := r.FormValue("transcription")
		file, handler, err := r.FormFile("audio")

		var audioURL string
		isVoice := false

		if err == nil {
			defer file.Close()
			isVoice = true

			// Create uploads directory if it doesn't exist
			uploadDir := "./uploads/voice_notes"
			os.MkdirAll(uploadDir, os.ModePerm)

			// Generate unique filename
			filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(handler.Filename))
			filePath := filepath.Join(uploadDir, filename)

			// Save file
			dst, err := os.Create(filePath)
			if err != nil {
				http.Error(w, "Unable to save audio file", http.StatusInternalServerError)
				return
			}
			defer dst.Close()

			if _, err := io.Copy(dst, file); err != nil {
				http.Error(w, "Unable to write file", http.StatusInternalServerError)
				return
			}

			// Set URL path
			audioURL = "/uploads/voice_notes/" + filename
		}

		// Create DB Entry
		inquiry := models.Inquiry{
			ID:            primitive.NewObjectID(),
			Transcription: transcription,
			AudioURL:      audioURL,
			IsVoice:       isVoice,
			Status:        "pending",
			CreatedAt:     time.Now(),
		}

		dbName := os.Getenv("DB_NAME")
		collection := db.GetCollection(client, dbName, "inquiries")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err = collection.InsertOne(ctx, inquiry)
		if err != nil {
			http.Error(w, "Failed to save inquiry", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(inquiry)
	}
}

// GetInquiries fetches all inquiries (sorted by new)
func GetInquiries(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		dbName := os.Getenv("DB_NAME")
		collection := db.GetCollection(client, dbName, "inquiries")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Sort by CreatedAt desc
		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

		cursor, err := collection.Find(ctx, bson.M{}, opts)
		if err != nil {
			http.Error(w, "Error fetching inquiries", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var inquiries []models.Inquiry
		if err = cursor.All(ctx, &inquiries); err != nil {
			http.Error(w, "Error decoding inquiries", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(inquiries)
	}
}

// DeleteInquiry removes an inquiry
func DeleteInquiry(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, _ := primitive.ObjectIDFromHex(params["id"])

		dbName := os.Getenv("DB_NAME")
		collection := db.GetCollection(client, dbName, "inquiries")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := collection.DeleteOne(ctx, bson.M{"_id": id})
		if err != nil {
			http.Error(w, "Error deleting inquiry", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Inquiry deleted"})
	}
}
