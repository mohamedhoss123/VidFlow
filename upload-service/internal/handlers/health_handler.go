package handlers

import (
	"context"
	"net/http"
	"time"
	"upload-service/internal/models"
	"upload-service/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// HealthHandler handles health check requests
type HealthHandler struct {
	minioService    *services.MinIOService
	grpcService     *services.GRPCService
	rabbitmqService *services.RabbitMQService
	logger          *logrus.Logger
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(
	minioService *services.MinIOService,
	grpcService *services.GRPCService,
	rabbitmqService *services.RabbitMQService,
	logger *logrus.Logger,
) *HealthHandler {
	return &HealthHandler{
		minioService:    minioService,
		grpcService:     grpcService,
		rabbitmqService: rabbitmqService,
		logger:          logger,
	}
}

// HealthCheck performs a comprehensive health check
// @Summary Comprehensive health check
// @Description Performs health checks on all dependent services (MinIO, gRPC, RabbitMQ)
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} models.HealthResponse
// @Failure 503 {object} docs.ServiceUnavailableError "Service Unavailable - One or more dependencies are unhealthy"
// @Router /health [get]
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	response := models.HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Services:  make(map[string]string),
	}

	// Check MinIO
	if err := h.minioService.HealthCheck(ctx); err != nil {
		h.logger.WithError(err).Error("MinIO health check failed")
		response.Services["minio"] = "unhealthy: " + err.Error()
		response.Status = "unhealthy"
	} else {
		response.Services["minio"] = "healthy"
	}

	// Check gRPC (main-service)
	if err := h.grpcService.HealthCheck(ctx); err != nil {
		h.logger.WithError(err).Error("gRPC health check failed")
		response.Services["grpc"] = "unhealthy: " + err.Error()
		response.Status = "unhealthy"
	} else {
		response.Services["grpc"] = "healthy"
	}

	// Check RabbitMQ
	if err := h.rabbitmqService.HealthCheck(ctx); err != nil {
		h.logger.WithError(err).Error("RabbitMQ health check failed")
		response.Services["rabbitmq"] = "unhealthy: " + err.Error()
		response.Status = "unhealthy"
	} else {
		response.Services["rabbitmq"] = "healthy"
	}

	// Set HTTP status based on overall health
	statusCode := http.StatusOK
	if response.Status == "unhealthy" {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, response)
}

// LivenessProbe is a simple liveness check for Kubernetes
// @Summary Liveness probe
// @Description Simple liveness check to verify the service is alive
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} docs.LivenessResponse
// @Router /health/live [get]
func (h *HealthHandler) LivenessProbe(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "alive",
		"timestamp": time.Now(),
	})
}

// ReadinessProbe checks if the service is ready to accept requests
// @Summary Readiness probe
// @Description Checks if the service is ready to accept requests by verifying critical dependencies
// @Tags Health
// @Accept json
// @Produce json
// @Success 200 {object} docs.ReadinessResponse
// @Failure 503 {object} docs.ServiceUnavailableError "Service Unavailable - Critical dependencies are not ready"
// @Router /health/ready [get]
func (h *HealthHandler) ReadinessProbe(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Quick check of critical services
	ready := true
	services := make(map[string]bool)

	// Check MinIO (critical for uploads)
	if err := h.minioService.HealthCheck(ctx); err != nil {
		services["minio"] = false
		ready = false
	} else {
		services["minio"] = true
	}

	// Check gRPC (critical for video creation)
	if err := h.grpcService.HealthCheck(ctx); err != nil {
		services["grpc"] = false
		ready = false
	} else {
		services["grpc"] = true
	}

	// RabbitMQ is less critical - uploads can work without it temporarily
	if err := h.rabbitmqService.HealthCheck(ctx); err != nil {
		services["rabbitmq"] = false
		h.logger.WithError(err).Warn("RabbitMQ not ready, but service can still accept uploads")
	} else {
		services["rabbitmq"] = true
	}

	response := gin.H{
		"ready":     ready,
		"timestamp": time.Now(),
		"services":  services,
	}

	statusCode := http.StatusOK
	if !ready {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, response)
}
