package config

import (
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the upload service
type Config struct {
	HTTPPort            string
	GRPCMainServiceAddr string
	MaxFileSize         int64
	AllowedFileTypes    []string
	UploadDir           string
	LogLevel            string

	// MinIO Configuration
	MinIOEndpoint   string
	MinIOAccessKey  string
	MinIOSecretKey  string
	MinIOBucketName string
	MinIOUseSSL     bool

	// RabbitMQ Configuration
	RabbitMQURL   string
	RabbitMQQueue string
}

// Load loads configuration from environment variables with defaults
func Load() *Config {
	return &Config{
		HTTPPort:            getEnv("HTTP_PORT", "8081"),
		GRPCMainServiceAddr: getEnv("GRPC_MAIN_SERVICE_ADDR", "main-service:50051"),
		MaxFileSize:         getEnvAsInt64("MAX_FILE_SIZE", 500*1024*1024), // 500MB default
		AllowedFileTypes:    getEnvAsSlice("ALLOWED_FILE_TYPES", "video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm,video/mkv"),
		UploadDir:           getEnv("UPLOAD_DIR", "/tmp/uploads"),
		LogLevel:            getEnv("LOG_LEVEL", "info"),

		// MinIO Configuration
		MinIOEndpoint:   getEnv("MINIO_ENDPOINT", "minio:9000"),
		MinIOAccessKey:  getEnv("MINIO_ACCESS_KEY", "vidflow_admin"),
		MinIOSecretKey:  getEnv("MINIO_SECRET_KEY", "VidFlow_MinIO_2024!"),
		MinIOBucketName: getEnv("MINIO_BUCKET_NAME", "videos"),
		MinIOUseSSL:     getEnvAsBool("MINIO_USE_SSL", false),

		// RabbitMQ Configuration
		RabbitMQURL:   getEnv("RABBITMQ_URL", "amqp://vidflow_admin:VidFlow_RabbitMQ_2025!@rabbitmq:5672/vidflow"),
		RabbitMQQueue: getEnv("RABBITMQ_QUEUE", "video.quality.processing"),
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

// getEnvAsSlice gets an environment variable as a slice with a default value
func getEnvAsSlice(key, defaultValue string) []string {
	value := getEnv(key, defaultValue)
	return strings.Split(value, ",")
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
