package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/sandaru-fx/SentinelChild-System/backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Connect to MongoDB
	// clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	clientOptions := options.Client().ApplyURI("mongodb+srv://sandaruchamod62_db_user:sandaru2020@cluster0.hnkt4gn.mongodb.net/sentinel_child?retryWrites=true&w=majority&appName=Cluster0&authSource=admin")

	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.TODO())

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MongoDB!")

	db := client.Database("sentinel_child")
	reportCollection := db.Collection("reports")
	inquiryCollection := db.Collection("inquiries")

	// --- SEED REPORTS ---
	reports := []interface{}{
		models.Report{
			ID:          primitive.NewObjectID(),
			ChildName:   "Kamal Perera",
			Age:         "10",
			Description: "Child found wandering alone near pettah bus stand late at night.",
			Status:      "PENDING",
			CreatedAt:   time.Now().Add(-24 * time.Hour),
			Reporter:    &models.Reporter{Name: "Sunil Silva", Phone: "0771234567"},
			Location:    &models.Location{Lat: 6.9271, Lng: 79.8612},
		},
		models.Report{
			ID:          primitive.NewObjectID(),
			ChildName:   "Nethmi De Silva",
			Age:         "14",
			Description: "Report of possible child labor at a construction site in Kandy.",
			Status:      "INVESTIGATING",
			CreatedAt:   time.Now().Add(-48 * time.Hour),
			Reporter:    &models.Reporter{Name: "Anonymous", Phone: ""},
		},
		models.Report{
			ID:          primitive.NewObjectID(),
			ChildName:   "Unknown Boy",
			Age:         "8",
			Description: "Neighbor reported continuous crying and screaming from the house next door.",
			Status:      "VERIFIED",
			CreatedAt:   time.Now().Add(-72 * time.Hour),
			Reporter:    &models.Reporter{Name: "Mrs. Jayawardena", Phone: "0719876543"},
		},
		models.Report{
			ID:          primitive.NewObjectID(),
			ChildName:   "Samadhi",
			Age:         "12",
			Description: "Child begging near the traffic lights.",
			Status:      "PENDING",
			CreatedAt:   time.Now().Add(-5 * time.Hour),
		},
	}

	_, err = reportCollection.InsertMany(context.TODO(), reports)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Inserted %d reports\n", len(reports))

	// --- SEED INQUIRIES ---
	inquiries := []interface{}{
		// General Inquiries
		models.Inquiry{
			ID:         primitive.NewObjectID(),
			Type:       "general",
			Name:       "Dr. Pathirana",
			Email:      "pathirana@health.gov.lk",
			Department: "Medical",
			Message:    "Requesting update on the medical examination of Case #4521. Please verify records.",
			IsVoice:    false,
			Status:     "pending",
			CreatedAt:  time.Now().Add(-2 * time.Hour),
		},
		models.Inquiry{
			ID:         primitive.NewObjectID(),
			Type:       "general",
			Name:       "Officer Bandara",
			Email:      "bandara@police.lk",
			Department: "Police",
			Message:    "Need creating a joint task force for the recent trafficking alerts in Galle district.",
			IsVoice:    false,
			Status:     "reviewed",
			CreatedAt:  time.Now().Add(-10 * time.Hour),
		},
		// Voice Inquiries
		models.Inquiry{
			ID:            primitive.NewObjectID(),
			Type:          "voice",
			IsVoice:       true,
			Transcription: "Hello, I am calling to report a suspicious van near the school gate. It has been parked there for 2 hours.",
			AudioURL:      "", // Mock URL or empty
			Status:        "pending",
			CreatedAt:     time.Now().Add(-30 * time.Minute),
		},
		models.Inquiry{
			ID:            primitive.NewObjectID(),
			Type:          "voice",
			IsVoice:       true,
			Transcription: "Urgent check required at 5th Lane. Sounds of disturbance reported by neighbors.",
			AudioURL:      "",
			Status:        "pending",
			CreatedAt:     time.Now().Add(-15 * time.Minute),
		},
	}

	_, err = inquiryCollection.InsertMany(context.TODO(), inquiries)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Inserted %d inquiries\n", len(inquiries))
}
