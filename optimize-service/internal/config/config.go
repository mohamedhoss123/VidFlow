package config

import (
	"os"
	"strconv"
)

// Config holds all configuration for the optimization service
type Config struct {
	LogLevel string

	// MinIO Configuration
	MinIOEndpoint   string
	MinIOAccessKey  string
	MinIOSecretKey  string
	MinIOBucketName string
	MinIOUseSSL     bool

	// MinIO Signed URL Configuration
	SignedURLDownloadExpiry int64 // in seconds
	SignedURLUploadExpiry   int64 // in seconds
	SignedURLProcessExpiry  int64 // in seconds for video processing

	// RabbitMQ Configuration
	RabbitMQURL   string
	RabbitMQQueue string

	// Processing Configuration
	WorkingDir     string
	MaxConcurrency int
	ProcessTimeout int64 // in seconds
}

// Load loads configuration from environment variables with defaults
func Load() *Config {
	return &Config{
		LogLevel: getEnv("LOG_LEVEL", "info"),

		// MinIO Configuration
		MinIOEndpoint:   getEnv("MINIO_ENDPOINT", "minio:9000"),
		MinIOAccessKey:  getEnv("MINIO_ACCESS_KEY", "vidflow_admin"),
		MinIOSecretKey:  getEnv("MINIO_SECRET_KEY", "VidFlow_MinIO_2024!"),
		MinIOBucketName: getEnv("MINIO_BUCKET_NAME", "videos"),
		MinIOUseSSL:     getEnvAsBool("MINIO_USE_SSL", false),

		// RabbitMQ Configuration
		RabbitMQURL:   getEnv("RABBITMQ_URL", "amqp://vidflow_admin:VidFlow_RabbitMQ_2025!@rabbitmq:5672/vidflow"),
		RabbitMQQueue: getEnv("RABBITMQ_QUEUE", "video.quality.processing"),

		// Processing Configuration
		WorkingDir:     getEnv("WORKING_DIR", "./video"),
		MaxConcurrency: getEnvAsInt("MAX_CONCURRENCY", 2),
		ProcessTimeout: getEnvAsInt64("PROCESS_TIMEOUT", 3600), // 1 hour default
	}
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt64 gets an environment variable as int64 with a default value
func getEnvAsInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvAsInt gets an environment variable as int with a default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvAsBool gets an environment variable as bool with a default value
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
