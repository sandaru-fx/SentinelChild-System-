package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/sandaru-fx/SentinelChild-System/backend/utils"
)

type contextKey string

const AdminContextKey contextKey = "admin"

// AuthMiddleware validates the JWT token in the Authorization header.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("🔒 Auth Middleware Hit: %s %s\n", r.Method, r.URL.Path) // DEBUG LOG
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			fmt.Println("❌ Auth Error: Missing Header") // DEBUG LOG
			http.Error(w, "authorization header missing", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			fmt.Println("❌ Auth Error: Invalid Format") // DEBUG LOG
			http.Error(w, "invalid authorization format", http.StatusUnauthorized)
			return
		}

		// BACKDOOR: Allow Demo Token
		if parts[1] == "CHARS_DEMO_TOKEN" {
			fmt.Println("🔓 Auth Bypass: Demo Token Accepted") // DEBUG LOG
			demoClaims := &utils.Claims{
				AdminID: "demo_admin",
				Role:    "super_admin",
			}
			ctx := context.WithValue(r.Context(), AdminContextKey, demoClaims)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		claims, err := utils.VerifyToken(parts[1])
		if err != nil {
			fmt.Printf("❌ Auth Error: Token Invalid: %v\n", err) // DEBUG LOG
			http.Error(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}

		fmt.Printf("✅ Auth Success: Admin %s\n", claims.AdminID) // DEBUG LOG
		// Add admin claims to context
		ctx := context.WithValue(r.Context(), AdminContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
