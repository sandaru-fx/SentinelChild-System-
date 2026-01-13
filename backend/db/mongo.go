package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Connect establishes a MongoDB client using the provided URI and a 10s timeout.
func Connect(ctx context.Context, uri string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(uri)

	// Mask password for safe logging
	maskedURI := uri
	if len(uri) > 20 {
		maskedURI = uri[:15] + "..." + uri[len(uri)-10:]
	}
	log.Printf("[DATABASE] Attempting connection to: %s", maskedURI)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, err
	}
	// verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}
	return client, nil
}

// Close disconnects the client.
func Close(ctx context.Context, client *mongo.Client) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	return client.Disconnect(ctx)
}

// GetCollection returns a collection reference from the client.
func GetCollection(client *mongo.Client, dbName, collName string) *mongo.Collection {
	return client.Database(dbName).Collection(collName)
}
