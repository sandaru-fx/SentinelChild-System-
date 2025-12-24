package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"

	"github.com/sandaru-fx/SentinelChild-System/backend/controllers"
	"github.com/sandaru-fx/SentinelChild-System/backend/db"
)

func main() {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI is required; set it in env or create a .env file")
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "sentinel_child"
	}

	ctx := context.Background()
	client, err := db.Connect(ctx, uri)
	if err != nil {
		log.Fatalf("failed connect mongo: %v", err)
	}
	defer db.Close(ctx, client)

	r := mux.NewRouter()
	r.HandleFunc("/reports", controllers.CreateReport(client)).Methods(http.MethodPost)
	r.HandleFunc("/reports", controllers.ListReports(client)).Methods(http.MethodGet)
	r.HandleFunc("/reports/{id}", controllers.GetReport(client)).Methods(http.MethodGet)
	r.HandleFunc("/reports/{id}", controllers.UpdateReport(client)).Methods(http.MethodPut)
	r.HandleFunc("/reports/{id}", controllers.DeleteReport(client)).Methods(http.MethodDelete)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Handler:      r,
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("server listening on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
