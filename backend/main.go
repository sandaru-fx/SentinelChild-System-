package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"github.com/sandaru-fx/SentinelChild-System/backend/controllers"
	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/middleware"
)

func main() {
	// Load .env file
	_ = godotenv.Load()

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
	log.Println("✅ MongoDB connection established successfully")
	log.Println("🚀 CHARS BACKEND UPDATED v2.0 - INQUIRIES FIXED")
	defer db.Close(ctx, client)

	// Initialize WebSocket Hub
	hub := controllers.NewHub(client)
	go hub.Run()

	r := mux.NewRouter()

	// Public Endpoints
	r.HandleFunc("/ws", controllers.HandleWS(hub))
	r.HandleFunc("/submit-report", controllers.CreateReport(client)).Methods(http.MethodPost)
	r.HandleFunc("/report-status", controllers.ListReports(client)).Queries("id", "{id}").Methods(http.MethodGet)
	r.HandleFunc("/admin-login", controllers.AdminLogin(client)).Methods(http.MethodPost)

	// Live Chat (Public)
	r.HandleFunc("/chat/start", controllers.StartChatSession(client)).Methods(http.MethodPost)
	r.HandleFunc("/chat/{id}/message", controllers.SendMessage(client)).Methods(http.MethodPost)

	// Voice/Text Inquiries (Public)
	r.HandleFunc("/inquiries", controllers.CreateInquiry(client)).Methods(http.MethodPost)

	// Educational Hub (Public)
	r.HandleFunc("/resources", controllers.GetResources(client)).Methods(http.MethodGet)

	// Emergency Contacts (Public)
	r.HandleFunc("/hotlines", controllers.GetHotlines(client)).Methods(http.MethodGet)

	// Site Settings/Policies (Public)
	r.HandleFunc("/settings/{key}", controllers.GetSetting(client)).Methods(http.MethodGet)

	// Serve Static Files (Audio Uploads)
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	// Admin Subrouter (Protected)
	admin := r.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.AuthMiddleware)

	admin.HandleFunc("/reports", controllers.ListReports(client)).Methods(http.MethodGet)
	admin.HandleFunc("/update-report", controllers.UpdateReport(client)).Methods(http.MethodPatch)
	admin.HandleFunc("/reports/{id}", controllers.GetReport(client)).Methods(http.MethodGet)
	admin.HandleFunc("/reports/{id}", controllers.DeleteReport(client)).Methods(http.MethodDelete)
	admin.HandleFunc("/reports/bulk", controllers.BulkUpdateReports(client)).Methods(http.MethodPatch)

	// Admin Chat Endpoints
	admin.HandleFunc("/chat/sessions", controllers.ListChatSessions(client)).Methods(http.MethodGet)
	admin.HandleFunc("/chat/{id}/read", controllers.MarkChatRead(client)).Methods(http.MethodPatch)

	// Admin Inquiry Management
	admin.HandleFunc("/inquiries", controllers.GetInquiries(client)).Methods(http.MethodGet)
	admin.HandleFunc("/inquiries/{id}", controllers.DeleteInquiry(client)).Methods(http.MethodDelete)

	// Admin Personnel Management
	admin.HandleFunc("/personnel", controllers.ListAdmins(client)).Methods(http.MethodGet)
	admin.HandleFunc("/personnel", controllers.CreateAdmin(client)).Methods(http.MethodPost)
	admin.HandleFunc("/personnel/{id}", controllers.UpdateAdmin(client)).Methods(http.MethodPatch)
	admin.HandleFunc("/personnel/{id}", controllers.DeleteAdmin(client)).Methods(http.MethodDelete)
	admin.HandleFunc("/logs", controllers.GetAuditLogs(client)).Methods(http.MethodGet)

	// Admin Educational Hub Management
	admin.HandleFunc("/resources", controllers.CreateResource(client)).Methods(http.MethodPost)
	admin.HandleFunc("/resources/{id}", controllers.UpdateResource(client)).Methods(http.MethodPatch)
	admin.HandleFunc("/resources/{id}", controllers.DeleteResource(client)).Methods(http.MethodDelete)

	// Admin Emergency Hotline Management
	admin.HandleFunc("/hotlines", controllers.CreateHotline(client)).Methods(http.MethodPost)
	admin.HandleFunc("/hotlines/{id}", controllers.UpdateHotline(client)).Methods(http.MethodPatch)
	admin.HandleFunc("/hotlines/{id}", controllers.DeleteHotline(client)).Methods(http.MethodDelete)

	// Admin Settings Management
	admin.HandleFunc("/settings/{key}", controllers.UpdateSetting(client)).Methods(http.MethodPost)

	// Admin Audit & Workflow
	admin.HandleFunc("/audit-logs", controllers.GetAuditLogs(client)).Methods(http.MethodGet)
	admin.HandleFunc("/reports/{id}/internal-notes", controllers.AddInternalNote(client)).Methods(http.MethodPost)

	// Analytics & Geospatial
	admin.HandleFunc("/analytics/summary", controllers.GetAnalyticsSummary(client)).Methods(http.MethodGet)
	admin.HandleFunc("/analytics/geo", controllers.GetGeospatialData(client)).Methods(http.MethodGet)
	admin.HandleFunc("/analytics/insights", controllers.GetAIInsights(client)).Methods(http.MethodGet)

	// Add CORS support
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // In prod, specify the exact domain
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Handler:      handler,
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("server listening on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
