package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/sandaru-fx/SentinelChild-System/backend/models"
	"github.com/sandaru-fx/SentinelChild-System/backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetAnalyticsSummary returns aggregated report statistics.
func GetAnalyticsSummary(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := collection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Aggregate by Status
		statusPipe := mongo.Pipeline{
			{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$status"}, {Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}}}}},
		}
		statusCursor, err := col.Aggregate(ctx, statusPipe)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var statusResults []bson.M
		if err = statusCursor.All(ctx, &statusResults); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Aggregate by Priority
		priorityPipe := mongo.Pipeline{
			{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$priority"}, {Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}}}}},
		}
		priorityCursor, err := col.Aggregate(ctx, priorityPipe)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var priorityResults []bson.M
		if err = priorityCursor.All(ctx, &priorityResults); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Aggregate Daily Counts (Last 7 days)
		sevenDaysAgo := time.Now().AddDate(0, 0, -7)
		dailyPipe := mongo.Pipeline{
			{{Key: "$match", Value: bson.D{{Key: "createdAt", Value: bson.D{{Key: "$gte", Value: sevenDaysAgo}}}}}},
			{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: bson.D{{Key: "$dateToString", Value: bson.D{{Key: "format", Value: "%Y-%m-%d"}, {Key: "date", Value: "$createdAt"}}}}},
				{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
			{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
		}
		dailyCursor, err := col.Aggregate(ctx, dailyPipe)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var dailyResults []bson.M
		if err = dailyCursor.All(ctx, &dailyResults); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"byStatus":   statusResults,
			"byPriority": priorityResults,
			"daily":      dailyResults,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// GetGeospatialData returns report locations for mapping.
func GetGeospatialData(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := collection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		filter := bson.M{"location": bson.M{"$ne": nil}}
		cur, err := col.Find(ctx, filter)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cur.Close(ctx)

		var reports []models.Report
		if err = cur.All(ctx, &reports); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Simplify for map
		var geoData []interface{}
		for _, rep := range reports {
			if rep.Location != nil {
				geoData = append(geoData, map[string]interface{}{
					"id":        rep.ID.Hex(),
					"lat":       rep.Location.Lat,
					"lng":       rep.Location.Lng,
					"intensity": 0.5, // Default for now, can be based on priority
					"status":    rep.Status,
				})
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(geoData)
	}
}

// GetAIInsights returns a strategic overview of report trends using Gemini.
func GetAIInsights(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		col := collection(client)
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Fetch recent reports for context
		opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(10)
		cur, err := col.Find(ctx, bson.M{}, opts)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var reports []models.Report
		if err = cur.All(ctx, &reports); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Prepare prompt for Gemini
		prompt := "Analyze these recent child safety reports and provide a 3-sentence strategic summary of the trends and any urgent focus areas: \n"
		for _, rep := range reports {
			prompt += "- " + rep.Description + " (Status: " + rep.Status + ")\n"
		}

		// Call Gemini Utility
		insight, err := utils.GenerateAIResponse(prompt)
		if err != nil {
			http.Error(w, "AI generation failed: "+err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"insight": insight,
		})
	}
}
