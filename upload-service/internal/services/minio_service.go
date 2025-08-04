package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"vidflow/upload-service/internal/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/sirupsen/logrus"
)

// MinIOService handles MinIO object storage operations
type MinIOService struct {
	client     *minio.Client
	bucketName string
	logger     *logrus.Logger
	endpoint   string
	useSSL     bool
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
	}

	// Ensure bucket exists
	if err := service.ensureBucketExists(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ensure bucket exists: %w", err)
	}

	logger.WithFields(logrus.Fields{
		"endpoint": cfg.MinIOEndpoint,
		"bucket":   cfg.MinIOBucketName,
		"ssl":      cfg.MinIOUseSSL,
	}).Info("MinIO service initialized successfully")

	return service, nil
}

// ensureBucketExists creates the bucket if it doesn't exist
func (m *MinIOService) ensureBucketExists(ctx context.Context) error {
	exists, err := m.client.BucketExists(ctx, m.bucketName)
	if err != nil {
		return fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		err = m.client.MakeBucket(ctx, m.bucketName, minio.MakeBucketOptions{
			Region: "us-east-1",
		})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}
		m.logger.WithField("bucket", m.bucketName).Info("Created MinIO bucket")
	}

	return nil
}

// UploadFile uploads a file to MinIO and returns the file URL
func (m *MinIOService) UploadFile(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader, objectName string) (string, error) {
	// Set timeout for upload operation
	uploadCtx, cancel := context.WithTimeout(ctx, 10*time.Minute)
	defer cancel()

	// Determine content type
	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Get file size
	fileSize := fileHeader.Size

	m.logger.WithFields(logrus.Fields{
		"object_name":  objectName,
		"content_type": contentType,
		"file_size":    fileSize,
		"bucket":       m.bucketName,
	}).Info("Starting file upload to MinIO")

	// Upload file using PutObject
	uploadInfo, err := m.client.PutObject(uploadCtx, m.bucketName, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
		UserMetadata: map[string]string{
			"original-filename": fileHeader.Filename,
			"upload-timestamp":  time.Now().UTC().Format(time.RFC3339),
		},
	})
	if err != nil {
		m.logger.WithError(err).WithFields(logrus.Fields{
			"object_name": objectName,
			"bucket":      m.bucketName,
		}).Error("Failed to upload file to MinIO")
		return "", fmt.Errorf("failed to upload file to MinIO: %w", err)
	}

	// Generate file URL
	fileURL := m.generateFileURL(objectName)

	m.logger.WithFields(logrus.Fields{
		"object_name": objectName,
		"file_url":    fileURL,
		"etag":        uploadInfo.ETag,
		"size":        uploadInfo.Size,
	}).Info("File uploaded to MinIO successfully")

	return fileURL, nil
}

// generateFileURL generates the URL for accessing the uploaded file
func (m *MinIOService) generateFileURL(objectName string) string {
	protocol := "http"
	if m.useSSL {
		protocol = "https"
	}
	return fmt.Sprintf("%s://%s/%s/%s", protocol, m.endpoint, m.bucketName, objectName)
}

// DeleteFile deletes a file from MinIO
func (m *MinIOService) DeleteFile(ctx context.Context, objectName string) error {
	deleteCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	err := m.client.RemoveObject(deleteCtx, m.bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		m.logger.WithError(err).WithFields(logrus.Fields{
			"object_name": objectName,
			"bucket":      m.bucketName,
		}).Error("Failed to delete file from MinIO")
		return fmt.Errorf("failed to delete file from MinIO: %w", err)
	}

	m.logger.WithFields(logrus.Fields{
		"object_name": objectName,
		"bucket":      m.bucketName,
	}).Info("File deleted from MinIO successfully")

	return nil
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

// GenerateObjectName generates a unique object name for the file
func (m *MinIOService) GenerateObjectName(originalFilename, videoID string) string {
	ext := filepath.Ext(originalFilename)
	return fmt.Sprintf("%s%s", videoID, ext)
}
