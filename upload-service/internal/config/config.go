package config

import (
	"log"
	"os"

	"github.com/spf13/viper"
)

// Config holds all configuration for the upload service
type Config struct {
	// Server configuration
	Server ServerConfig `mapstructure:"server"`
	
	// MinIO configuration
	MinIO MinIOConfig `mapstructure:"minio"`
	
	// RabbitMQ configuration
	RabbitMQ RabbitMQConfig `mapstructure:"rabbitmq"`
	
	// gRPC configuration
	GRPC GRPCConfig `mapstructure:"grpc"`
	
	// Logging configuration
	Log LogConfig `mapstructure:"log"`
	
	// Upload configuration
	Upload UploadConfig `mapstructure:"upload"`
}

type ServerConfig struct {
	Host string `mapstructure:"host"`
	Port string `mapstructure:"port"`
}

type MinIOConfig struct {
	Endpoint        string `mapstructure:"endpoint"`
	AccessKey       string `mapstructure:"access_key"`
	SecretKey       string `mapstructure:"secret_key"`
	BucketName      string `mapstructure:"bucket_name"`
	UseSSL          bool   `mapstructure:"use_ssl"`
	Region          string `mapstructure:"region"`
}

type RabbitMQConfig struct {
	URL   string `mapstructure:"url"`
	Queue string `mapstructure:"queue"`
}

type GRPCConfig struct {
	MainServiceAddress string `mapstructure:"main_service_address"`
	Timeout            int    `mapstructure:"timeout"`
}

type LogConfig struct {
	Level  string `mapstructure:"level"`
	Format string `mapstructure:"format"`
}

type UploadConfig struct {
	MaxFileSize   int64    `mapstructure:"max_file_size"`
	AllowedTypes  []string `mapstructure:"allowed_types"`
	TempDir       string   `mapstructure:"temp_dir"`
}

// Load loads configuration from environment variables and config files
func Load() *Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	
	// Set default values
	setDefaults()
	
	// Read from environment variables
	viper.AutomaticEnv()
	
	// Try to read config file (optional)
	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: Could not read config file: %v", err)
	}
	
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("Unable to decode config: %v", err)
	}
	
	// Override with environment variables
	overrideWithEnv(&config)
	
	return &config
}

func setDefaults() {
	// Server defaults
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.port", "8081")
	
	// MinIO defaults
	viper.SetDefault("minio.endpoint", "localhost:9000")
	viper.SetDefault("minio.access_key", "vidflow_admin")
	viper.SetDefault("minio.secret_key", "VidFlow_MinIO_2024!")
	viper.SetDefault("minio.bucket_name", "videos")
	viper.SetDefault("minio.use_ssl", false)
	viper.SetDefault("minio.region", "us-east-1")
	
	// RabbitMQ defaults
	viper.SetDefault("rabbitmq.url", "amqp://vidflow_admin:VidFlow_RabbitMQ_2025!@localhost:5672/vidflow")
	viper.SetDefault("rabbitmq.queue", "video.quality.processing")
	
	// gRPC defaults
	viper.SetDefault("grpc.main_service_address", "localhost:50051")
	viper.SetDefault("grpc.timeout", 30)
	
	// Log defaults
	viper.SetDefault("log.level", "info")
	viper.SetDefault("log.format", "json")
	
	// Upload defaults
	viper.SetDefault("upload.max_file_size", 1073741824) // 1GB
	viper.SetDefault("upload.allowed_types", []string{"video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/mkv"})
	viper.SetDefault("upload.temp_dir", "/tmp/uploads")
}

func overrideWithEnv(config *Config) {
	// Server
	if host := os.Getenv("SERVER_HOST"); host != "" {
		config.Server.Host = host
	}
	if port := os.Getenv("SERVER_PORT"); port != "" {
		config.Server.Port = port
	}
	
	// MinIO
	if endpoint := os.Getenv("MINIO_ENDPOINT"); endpoint != "" {
		config.MinIO.Endpoint = endpoint
	}
	if accessKey := os.Getenv("MINIO_ACCESS_KEY"); accessKey != "" {
		config.MinIO.AccessKey = accessKey
	}
	if secretKey := os.Getenv("MINIO_SECRET_KEY"); secretKey != "" {
		config.MinIO.SecretKey = secretKey
	}
	if bucketName := os.Getenv("MINIO_BUCKET_NAME"); bucketName != "" {
		config.MinIO.BucketName = bucketName
	}
	
	// RabbitMQ
	if url := os.Getenv("RABBITMQ_URL"); url != "" {
		config.RabbitMQ.URL = url
	}
	if queue := os.Getenv("RABBITMQ_QUEUE"); queue != "" {
		config.RabbitMQ.Queue = queue
	}
	
	// gRPC
	if addr := os.Getenv("GRPC_MAIN_SERVICE_ADDRESS"); addr != "" {
		config.GRPC.MainServiceAddress = addr
	}
	
	// Log
	if level := os.Getenv("LOG_LEVEL"); level != "" {
		config.Log.Level = level
	}
}
