package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"vidflow/upload-service/internal/services"

	"github.com/sirupsen/logrus"
)

// HealthHandler handles health check requests
type HealthHandler struct {
	grpcClient      *services.GRPCClient
	minioService    *services.MinIOService
	rabbitmqService *services.RabbitMQService
	logger          *logrus.Logger
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(grpcClient *services.GRPCClient, minioService *services.MinIOService, rabbitmqService *services.RabbitMQService, logger *logrus.Logger) *HealthHandler {
	return &HealthHandler{
		grpcClient:      grpcClient,
		minioService:    minioService,
		rabbitmqService: rabbitmqService,
		logger:          logger,
	}
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Services  map[string]string `json:"services"`
	Version   string            `json:"version,omitempty"`
}

// HandleHealth performs health checks and returns service status
func (h *HealthHandler) HandleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check gRPC connection to main service
	grpcStatus := "healthy"
	if err := h.grpcClient.HealthCheck(ctx); err != nil {
		h.logger.WithError(err).Warn("gRPC health check failed")
		grpcStatus = "unhealthy"
	}

	// Check MinIO service
	minioStatus := "healthy"
	if err := h.minioService.HealthCheck(ctx); err != nil {
		h.logger.WithError(err).Warn("MinIO health check failed")
		minioStatus = "unhealthy"
	}

	// Check RabbitMQ service
	rabbitmqStatus := "healthy"
	if err := h.rabbitmqService.HealthCheck(ctx); err != nil {
		h.logger.WithError(err).Warn("RabbitMQ health check failed")
		rabbitmqStatus = "unhealthy"
	}

	// Determine overall status
	overallStatus := "healthy"
	if grpcStatus != "healthy" || minioStatus != "healthy" || rabbitmqStatus != "healthy" {
		overallStatus = "degraded"
	}

	response := HealthResponse{
		Status:    overallStatus,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Services: map[string]string{
			"grpc_main_service": grpcStatus,
			"minio_storage":     minioStatus,
			"rabbitmq_queue":    rabbitmqStatus,
			"http_server":       "healthy",
		},
		Version: "1.0.0",
	}

	// Set appropriate HTTP status code
	statusCode := http.StatusOK
	if overallStatus != "healthy" {
		statusCode = http.StatusServiceUnavailable
	}

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// HandleReadiness handles readiness probe requests
func (h *HealthHandler) HandleReadiness(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Simple readiness check - service is ready if it can respond
	response := map[string]interface{}{
		"ready":     true,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HandleLiveness handles liveness probe requests
func (h *HealthHandler) HandleLiveness(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Simple liveness check - service is alive if it can respond
	response := map[string]interface{}{
		"alive":     true,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
