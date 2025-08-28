package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"upload-service/internal/config"
	"upload-service/internal/handlers"
	"upload-service/internal/middleware"
	"upload-service/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger := setupLogger(cfg)
	logger.Info("Starting VidFlow Upload Service...")

	// Create temp directory if it doesn't exist
	if err := os.MkdirAll(cfg.Upload.TempDir, 0755); err != nil {
		logger.WithError(err).Fatal("Failed to create temp directory")
	}

	// Initialize services
	minioService, err := services.NewMinIOService(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize MinIO service")
	}

	grpcService, err := services.NewGRPCService(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize gRPC service")
	}
	defer grpcService.Close()

	rabbitmqService, err := services.NewRabbitMQService(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize RabbitMQ service")
	}
	defer rabbitmqService.Close()

	// Initialize handlers
	uploadHandler := handlers.NewUploadHandler(minioService, grpcService, rabbitmqService, cfg, logger)
	healthHandler := handlers.NewHealthHandler(minioService, grpcService, rabbitmqService, logger)

	// Setup Gin router
	router := setupRouter(cfg, logger, uploadHandler, healthHandler)

	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.WithFields(logrus.Fields{
			"host": cfg.Server.Host,
			"port": cfg.Server.Port,
		}).Info("Starting HTTP server")

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Failed to start server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Create context with timeout for graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown HTTP server
	if err := server.Shutdown(ctx); err != nil {
		logger.WithError(err).Error("Server forced to shutdown")
	}

	logger.Info("Server shutdown completed")
}

// setupLogger configures the logger based on configuration
func setupLogger(cfg *config.Config) *logrus.Logger {
	logger := logrus.New()

	// Set log level
	level, err := logrus.ParseLevel(cfg.Log.Level)
	if err != nil {
		level = logrus.InfoLevel
	}
	logger.SetLevel(level)

	// Set log format
	if cfg.Log.Format == "json" {
		logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	} else {
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: time.RFC3339,
		})
	}

	return logger
}

// setupRouter configures the Gin router with all routes and middleware
func setupRouter(cfg *config.Config, logger *logrus.Logger, uploadHandler *handlers.UploadHandler, healthHandler *handlers.HealthHandler) *gin.Engine {
	// Set Gin mode based on log level
	if cfg.Log.Level == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Global middleware
	router.Use(middleware.ErrorHandlingMiddleware(logger))
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(middleware.RequestIDMiddleware())
	router.Use(middleware.HealthCheckMiddleware())
	router.Use(middleware.LoggingMiddleware(logger))
	router.Use(middleware.RateLimitMiddleware(logger))

	// Health check routes (no auth required)
	health := router.Group("/health")
	{
		health.GET("", healthHandler.HealthCheck)
		health.GET("/live", healthHandler.LivenessProbe)
		health.GET("/ready", healthHandler.ReadinessProbe)
	}

	// API routes
	api := router.Group("/api/v1")
	{
		// Upload routes
		upload := api.Group("/upload")
		upload.Use(middleware.RequestSizeLimitMiddleware(cfg.Upload.MaxFileSize))
		{
			upload.POST("/video", uploadHandler.UploadVideo)
			upload.GET("/status/:video_id", uploadHandler.GetUploadStatus)
			upload.GET("/limits", uploadHandler.GetUploadLimits)
		}
	}

	// Root route
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service":     "VidFlow Upload Service",
			"version":     "1.0.0",
			"status":      "running",
			"timestamp":   time.Now(),
			"endpoints": gin.H{
				"health":        "/health",
				"upload_video":  "/api/v1/upload/video",
				"upload_status": "/api/v1/upload/status/:video_id",
				"upload_limits": "/api/v1/upload/limits",
			},
		})
	})

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Not Found",
			"code":    http.StatusNotFound,
			"message": "The requested endpoint was not found",
			"path":    c.Request.URL.Path,
		})
	})

	return router
}
