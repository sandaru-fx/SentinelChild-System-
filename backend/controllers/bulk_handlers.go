package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/sandaru-fx/SentinelChild-System/backend/middleware"
	"github.com/sandaru-fx/SentinelChild-System/backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// BulkUpdateReports updates multiple reports at once.
func BulkUpdateReports(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			IDs      []string `json:"ids"`
			Status   string   `json:"status"`
			Priority string   `json:"priority"`
			Note     string   `json:"note"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if len(req.IDs) == 0 {
			http.Error(w, "no ids provided", http.StatusBadRequest)
			return
		}

		var objIDs []primitive.ObjectID
		for _, id := range req.IDs {
			oid, err := primitive.ObjectIDFromHex(id)
			if err == nil {
				objIDs = append(objIDs, oid)
			}
		}

		update := bson.M{
			"$set": bson.M{
				"updatedAt": time.Now(),
			},
		}
		if req.Status != "" {
			update["$set"].(bson.M)["status"] = req.Status
		}
		if req.Priority != "" {
			update["$set"].(bson.M)["priority"] = req.Priority
		}
		if req.Note != "" {
			update["$set"].(bson.M)["adminNotes"] = req.Note
		}

		adminID := "system"
		adminRole := "system"
		if claims, ok := r.Context().Value(middleware.AdminContextKey).(*utils.Claims); ok {
			adminID = claims.AdminID
			adminRole = claims.Role
		}

		// If status changed, we'd ideally push history for each. For bulk, we'll keep it simple:
		// Just update the status and basic fields.

		col := collection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		res, err := col.UpdateMany(ctx, bson.M{"_id": bson.M{"$in": objIDs}}, update)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		LogActivity(client, adminID, adminRole, "BULK_UPDATE_REPORTS", "", "Admin bulk updated reports")

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"matched": res.MatchedCount,
			"updated": res.ModifiedCount,
		})
	}
}
