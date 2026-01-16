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
	"github.com/sandaru-fx/SentinelChild-System/backend/utils"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CreateInquiry handles voice/text inquiry submission
func CreateInquiry(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("📢 CreateInquiry ENDPOINT HIT") // DEBUG LOG
		contentType := r.Header.Get("Content-Type")

		var inquiry models.Inquiry
		inquiry.ID = primitive.NewObjectID()
		inquiry.CreatedAt = time.Now()
		inquiry.Status = "pending"

		if contentType == "application/json" {
			// Handle General Inquiry (JSON)
			if err := json.NewDecoder(r.Body).Decode(&inquiry); err != nil {
				fmt.Printf("❌ Invalid JSON Error: %v\n", err) // DEBUG LOG
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}
			inquiry.Type = "general"
			inquiry.IsVoice = false
		} else {
			// Handle Voice Inquiry (Multipart)
			// Parse multipart form (max 10MB)
			if err := r.ParseMultipartForm(10 << 20); err != nil {
				// Continue if it's not multipart, though typically it should be for voice
			}

			transcription := r.FormValue("transcription")
			file, handler, err := r.FormFile("audio")

			var audioURL string
			isVoice := false

			if err == nil {
				defer file.Close()
				isVoice = true

				uploadDir := "./uploads/voice_notes"
				os.MkdirAll(uploadDir, os.ModePerm)

				filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(handler.Filename))
				filePath := filepath.Join(uploadDir, filename)

				dst, err := os.Create(filePath)
				if err != nil {
					fmt.Printf("❌ File Create Error: %v\n", err) // DEBUG LOG
					http.Error(w, "Unable to save audio file", http.StatusInternalServerError)
					return
				}
				defer dst.Close()

				if _, err := io.Copy(dst, file); err != nil {
					fmt.Printf("❌ File Write Error: %v\n", err) // DEBUG LOG
					http.Error(w, "Unable to write file", http.StatusInternalServerError)
					return
				}

				// Automatic Transcription with Gemini 2.0
				if transcription == "" || transcription == "(Audio Only Report)" {
					file.Seek(0, 0) // Reset file pointer
					audioData, _ := io.ReadAll(file)
					tx, err := utils.TranscribeAudio(audioData, handler.Header.Get("Content-Type"))
					if err == nil {
						transcription = tx
					}
				}

				audioURL = "/uploads/voice_notes/" + filename
			}

			inquiry.Transcription = transcription
			inquiry.AudioURL = audioURL
			inquiry.IsVoice = isVoice
			if isVoice {
				inquiry.Type = "voice"
			} else {
				inquiry.Type = "general"
			}
		}

		dbName := os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "sentinel_child"
		}
		collection := db.GetCollection(client, dbName, "inquiries")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := collection.InsertOne(ctx, inquiry)
		if err != nil {
			fmt.Printf("❌ Failed to insert inquiry: %v\n", err) // DEBUG LOG
			http.Error(w, "Failed to save inquiry", http.StatusInternalServerError)
			return
		}

		fmt.Printf("✅ Inquiry Saved! ID: %s, Type: %s, Name: %s\n", inquiry.ID.Hex(), inquiry.Type, inquiry.Name) // DEBUG LOG
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(inquiry)
	}
}

// GetInquiries fetches all inquiries (sorted by new)
func GetInquiries(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("🔍 GetInquiries ENDPOINT HIT") // DEBUG LOG

		dbName := os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "sentinel_child"
		}
		collection := db.GetCollection(client, dbName, "inquiries")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Sort by CreatedAt desc
		opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

		cursor, err := collection.Find(ctx, bson.M{}, opts)
		if err != nil {
			fmt.Printf("❌ Find Error: %v\n", err) // DEBUG LOG
			http.Error(w, "Error fetching inquiries", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(ctx)

		var inquiries []models.Inquiry
		if err = cursor.All(ctx, &inquiries); err != nil {
			fmt.Printf("❌ Decode Error: %v\n", err) // DEBUG LOG
			http.Error(w, "Error decoding inquiries", http.StatusInternalServerError)
			return
		}

		fmt.Printf("📦 Found %d inquiries in DB\n", len(inquiries)) // DEBUG LOG
		json.NewEncoder(w).Encode(inquiries)
	}
}

// DeleteInquiry removes an inquiry
func DeleteInquiry(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, _ := primitive.ObjectIDFromHex(params["id"])

		dbName := os.Getenv("DB_NAME")
		if dbName == "" {
			dbName = "sentinel_child"
		}
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
