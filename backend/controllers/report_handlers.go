package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/middleware"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"
	"github.com/sandaru-fx/SentinelChild-System/backend/utils"
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
		var formData models.Report
		if err := json.NewDecoder(r.Body).Decode(&formData); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		now := time.Now()
		if formData.Status == "" {
			formData.Status = "PENDING"
		}
		formData.CreatedAt = now
		formData.UpdatedAt = now

		col := collection(client)
		res, err := col.InsertOne(context.Background(), formData)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Map the ObjectID to the frontend's expected string ID
		insertedID := res.InsertedID.(primitive.ObjectID).Hex()
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  true,
			"reportId": insertedID,
		})
	}
}

// ListReports returns a handler which lists reports with pagination and search.
func ListReports(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.URL.Query().Get("id")
		col := collection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if id != "" {
			objID, err := primitive.ObjectIDFromHex(id)
			if err != nil {
				http.Error(w, "invalid id", http.StatusBadRequest)
				return
			}
			var out models.Report
			if err := col.FindOne(ctx, bson.M{"_id": objID}).Decode(&out); err != nil {
				if err == mongo.ErrNoDocuments {
					w.Header().Set("Content-Type", "application/json")
					w.Write([]byte("null"))
					return
				}
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(out)
			return
		}

		// Pagination & Search
		query := r.URL.Query().Get("q")
		pageStr := r.URL.Query().Get("page")
		limitStr := r.URL.Query().Get("limit")

		page, _ := strconv.Atoi(pageStr)
		if page < 1 {
			page = 1
		}
		limit, _ := strconv.Atoi(limitStr)
		if limit < 1 || limit > 100 {
			limit = 20
		}

		filter := bson.M{}
		if query != "" {
			filter = bson.M{
				"$or": []bson.M{
					{"childName": bson.M{"$regex": query, "$options": "i"}},
					{"description": bson.M{"$regex": query, "$options": "i"}},
					{"status": bson.M{"$regex": query, "$options": "i"}},
				},
			}
		}

		// Get total count
		total, err := col.CountDocuments(ctx, filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		opts := options.Find().
			SetSort(bson.D{{Key: "createdAt", Value: -1}}).
			SetSkip(int64((page - 1) * limit)).
			SetLimit(int64(limit))

		cur, err := col.Find(ctx, filter, opts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cur.Close(ctx)

		var reports []models.Report = make([]models.Report, 0)
		if err := cur.All(ctx, &reports); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"data":  reports,
			"total": total,
			"page":  page,
			"limit": limit,
		})
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

		// Log the view action
		if claims, ok := r.Context().Value(middleware.AdminContextKey).(*utils.Claims); ok {
			LogActivity(client, claims.AdminID, claims.Role, "VIEW_CASE", id, "Admin viewed case details")
		}
	}
}

// UpdateReport updates a report status and notes.
func UpdateReport(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			ID       string `json:"id"`
			Status   string `json:"status"`
			Notes    string `json:"notes"`
			Priority string `json:"priority"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		id := req.ID
		if id == "" {
			id = mux.Vars(r)["id"]
		}

		if id == "" {
			http.Error(w, "missing id", http.StatusBadRequest)
			return
		}

		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		col := collection(client)

		// Fetch current report to see if status changed
		var oldReport models.Report
		_ = col.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&oldReport)

		update := bson.M{
			"$set": bson.M{
				"status":     req.Status,
				"adminNotes": req.Notes,
				"priority":   req.Priority,
				"updatedAt":  time.Now(),
			},
		}

		// If status changed, push to history
		adminID := "system"
		adminRole := "system"
		if claims, ok := r.Context().Value(middleware.AdminContextKey).(*utils.Claims); ok {
			adminID = claims.AdminID
			adminRole = claims.Role
		}

		if oldReport.Status != req.Status {
			historyUpdate := models.StatusUpdate{
				Status:    req.Status,
				Officer:   adminID,
				Timestamp: time.Now(),
				Note:      req.Notes,
			}
			update["$push"] = bson.M{"history": historyUpdate}
		}

		res, err := col.UpdateByID(context.Background(), objID, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Log the update action
		LogActivity(client, adminID, adminRole, "UPDATE_CASE", id, "Admin updated case status/notes")

		json.NewEncoder(w).Encode(res)
	}
}

// AddInternalNote adds a private note to a report.
func AddInternalNote(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		var req struct {
			Text string `json:"text"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		adminID := "unknown"
		if claims, ok := r.Context().Value(middleware.AdminContextKey).(*utils.Claims); ok {
			adminID = claims.AdminID
		}

		note := models.InternalNote{
			Author:    adminID,
			Text:      req.Text,
			Timestamp: time.Now(),
		}

		col := collection(client)
		_, err = col.UpdateByID(context.Background(), objID, bson.M{
			"$push": bson.M{"internalNotes": note},
			"$set":  bson.M{"updatedAt": time.Now()},
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		LogActivity(client, adminID, "note", "ADD_INTERNAL_NOTE", id, "Added internal officer note")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
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
