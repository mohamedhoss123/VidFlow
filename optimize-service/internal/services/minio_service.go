package services

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"optimize-service/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/sirupsen/logrus"
)

// MinIOService handles MinIO object storage operations for optimization service
type MinIOService struct {
	client     *minio.Client
	bucketName string
	logger     *logrus.Logger
	endpoint   string
	useSSL     bool
	config     *config.Config
}

// NewMinIOService creates a new MinIO service instance
func NewMinIOService(cfg *config.Config, logger *logrus.Logger) (*MinIOService, error) {
	// Initialize MinIO client
	client, err := minio.New(cfg.MinIOEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinIOAccessKey, cfg.MinIOSecretKey, ""),
		Secure: cfg.MinIOUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize MinIO client: %w", err)
	}

	service := &MinIOService{
		client:     client,
		bucketName: cfg.MinIOBucketName,
		logger:     logger,
		endpoint:   cfg.MinIOEndpoint,
		useSSL:     cfg.MinIOUseSSL,
		config:     cfg,
	}

	// Ensure bucket exists

	logger.WithFields(logrus.Fields{
		"endpoint": cfg.MinIOEndpoint,
		"bucket":   cfg.MinIOBucketName,
		"ssl":      cfg.MinIOUseSSL,
	}).Info("MinIO service initialized successfully")

	return service, nil
}

// UploadProcessedVideo uploads a processed video file to MinIO
func (m *MinIOService) UploadProcessedVideo(ctx context.Context, localPath, objectName string) error {

	m.logger.WithFields(logrus.Fields{
		"local_path":  localPath,
		"object_name": objectName,
		"bucket":      m.bucketName,
	}).Info("Starting processed video upload")

	// Open local file
	file, err := os.Open(localPath)
	if err != nil {
		return fmt.Errorf("failed to open local file: %w", err)
	}
	defer file.Close()

	// Get file info
	fileInfo, err := file.Stat()
	if err != nil {
		return fmt.Errorf("failed to get file info: %w", err)
	}

	// Determine content type based on file extension
	contentType := "application/octet-stream"
	ext := filepath.Ext(localPath)
	switch ext {
	case ".m3u8":
		contentType = "application/vnd.apple.mpegurl"
	case ".ts":
		contentType = "video/mp2t"
	}

	// Upload file
	_, err = m.client.PutObject(ctx, m.bucketName, objectName, file, fileInfo.Size(), minio.PutObjectOptions{
		ContentType: contentType,
		UserMetadata: map[string]string{
			"processed-timestamp": time.Now().UTC().Format(time.RFC3339),
			"original-filename":   filepath.Base(localPath),
		},
	})
	if err != nil {
		return fmt.Errorf("failed to upload processed video: %w", err)
	}

	m.logger.WithFields(logrus.Fields{
		"local_path":   localPath,
		"object_name":  objectName,
		"bucket":       m.bucketName,
		"content_type": contentType,
		"size":         fileInfo.Size(),
	}).Info("Processed video uploaded successfully")

	return nil
}

// GenerateSignedURLForProcessedVideo generates a signed URL for accessing processed video
func (m *MinIOService) GenerateSignedURLForProcessedVideo(ctx context.Context, objectName string) (*url.URL, error) {
	expiry := time.Duration(m.config.SignedURLDownloadExpiry) * time.Second

	// Set request parameters for content-disposition if needed
	reqParams := make(url.Values)

	presignedURL, err := m.client.PresignedGetObject(ctx, m.bucketName, objectName, expiry, reqParams)
	if err != nil {
		m.logger.WithError(err).WithFields(logrus.Fields{
			"object_name": objectName,
			"bucket":      m.bucketName,
			"expiry":      expiry,
		}).Error("Failed to generate presigned GET URL for processed video")
		return nil, fmt.Errorf("failed to generate presigned GET URL: %w", err)
	}

	return presignedURL, nil
}

// HealthCheck performs a health check on the MinIO service
func (m *MinIOService) HealthCheck(ctx context.Context) error {
	healthCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Check if bucket exists as a simple health check
	_, err := m.client.BucketExists(healthCtx, m.bucketName)
	if err != nil {
		m.logger.WithError(err).Warn("MinIO health check failed")
		return fmt.Errorf("MinIO health check failed: %w", err)
	}

	return nil
}
