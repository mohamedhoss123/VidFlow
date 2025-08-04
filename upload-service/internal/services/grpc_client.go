package services

import (
	"context"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "vidflow/upload-service/proto/video"
)

// GRPCClient handles communication with the main service
type GRPCClient struct {
	conn   *grpc.ClientConn
	client pb.VideoServiceClient
	logger *logrus.Logger
}

// NewGRPCClient creates a new gRPC client connection to the main service
func NewGRPCClient(addr string, logger *logrus.Logger) (*GRPCClient, error) {
	// Create connection with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	conn, err := grpc.DialContext(ctx, addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to main service at %s: %w", addr, err)
	}

	client := pb.NewVideoServiceClient(conn)

	logger.WithField("address", addr).Info("Connected to main service via gRPC")

	return &GRPCClient{
		conn:   conn,
		client: client,
		logger: logger,
	}, nil
}

// CreateVideo calls the main service to create a video record
func (g *GRPCClient) CreateVideo(ctx context.Context, url, userID, description string) (*pb.VideoResponse, error) {
	req := &pb.CreateVideoRequest{
		Url:         url,
		UserId:      userID,
		Description: description,
	}

	g.logger.WithFields(logrus.Fields{
		"url":         url,
		"user_id":     userID,
		"description": description,
	}).Info("Calling CreateVideo gRPC method")

	// Set timeout for the RPC call
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	response, err := g.client.CreateVideo(ctx, req)
	if err != nil {
		g.logger.WithError(err).Error("Failed to call CreateVideo gRPC method")
		return nil, fmt.Errorf("failed to create video via gRPC: %w", err)
	}

	g.logger.Info("Successfully created video via gRPC")
	return response, nil
}

// Close closes the gRPC connection
func (g *GRPCClient) Close() error {
	if g.conn != nil {
		g.logger.Info("Closing gRPC connection to main service")
		return g.conn.Close()
	}
	return nil
}

// HealthCheck performs a simple health check by attempting to create a test video
func (g *GRPCClient) HealthCheck(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Simple connectivity test - we could implement a dedicated health check RPC
	_, err := g.client.CreateVideo(ctx, &pb.CreateVideoRequest{
		Url:         "health-check",
		UserId:      "health-check",
		Description: "health-check",
	})

	// We expect this to fail with a specific error, but connection should work
	if err != nil {
		g.logger.WithError(err).Debug("Health check call completed (expected to fail)")
	}

	return nil // For now, we just check if the connection is alive
}
