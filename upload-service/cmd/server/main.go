package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"vidflow/upload-service/internal/config"
	"vidflow/upload-service/internal/handlers"
	"vidflow/upload-service/internal/middleware"
	"vidflow/upload-service/internal/services"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Setup logger
	logger := logrus.New()
	level, err := logrus.ParseLevel(cfg.LogLevel)
	if err != nil {
		logger.Warn("Invalid log level, using info")
		level = logrus.InfoLevel
	}
	logger.SetLevel(level)
	logger.SetFormatter(&logrus.JSONFormatter{})

	logger.WithFields(logrus.Fields{
		"http_port":              cfg.HTTPPort,
		"grpc_main_service_addr": cfg.GRPCMainServiceAddr,
		"max_file_size":          cfg.MaxFileSize,
		"upload_dir":             cfg.UploadDir,
	}).Info("Starting upload service")

	// Initialize gRPC client
	grpcClient, err := services.NewGRPCClient(cfg.GRPCMainServiceAddr, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize gRPC client")
	}
	defer grpcClient.Close()

	// Initialize MinIO service
	minioService, err := services.NewMinIOService(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize MinIO service")
	}

	// Initialize RabbitMQ service
	rabbitmqService, err := services.NewRabbitMQService(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize RabbitMQ service")
	}
	defer rabbitmqService.Close()

	// Initialize handlers
	uploadHandler := handlers.NewUploadHandler(cfg, grpcClient, minioService, rabbitmqService, logger)
	healthHandler := handlers.NewHealthHandler(grpcClient, minioService, rabbitmqService, logger)

	// Setup router
	router := mux.NewRouter()

	// Add middleware
	router.Use(middleware.LoggingMiddleware(logger))
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.RecoveryMiddleware(logger))

	// Register routes
	router.HandleFunc("/upload", uploadHandler.HandleUpload).Methods("POST", "OPTIONS")
	router.HandleFunc("/signed-url", uploadHandler.HandleGenerateSignedURL).Methods("POST", "OPTIONS")
	router.HandleFunc("/health", healthHandler.HandleHealth).Methods("GET")
	router.HandleFunc("/health/ready", healthHandler.HandleReadiness).Methods("GET")
	router.HandleFunc("/health/live", healthHandler.HandleLiveness).Methods("GET")

	// Root endpoint
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"service":"upload-service","status":"running","version":"1.0.0"}`))
	}).Methods("GET")

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.HTTPPort,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.WithField("port", cfg.HTTPPort).Info("Starting HTTP server")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Failed to start HTTP server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Create a deadline for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown HTTP server
	if err := srv.Shutdown(ctx); err != nil {
		logger.WithError(err).Error("Server forced to shutdown")
	}

	logger.Info("Server exited")
}
