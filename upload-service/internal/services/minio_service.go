package services

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"
	"upload-service/internal/config"
	"upload-service/internal/models"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/sirupsen/logrus"
)

// MinIOService handles MinIO operations
type MinIOService struct {
	client     *minio.Client
	bucketName string
	logger     *logrus.Logger
}

// NewMinIOService creates a new MinIO service instance
func NewMinIOService(cfg *config.Config, logger *logrus.Logger) (*MinIOService, error) {
	// Initialize MinIO client
	client, err := minio.New(cfg.MinIO.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinIO.AccessKey, cfg.MinIO.SecretKey, ""),
		Secure: cfg.MinIO.UseSSL,
		Region: cfg.MinIO.Region,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client: %w", err)
	}

	service := &MinIOService{
		client:     client,
		bucketName: cfg.MinIO.BucketName,
		logger:     logger,
	}

	// Ensure bucket exists
	if err := service.ensureBucketExists(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ensure bucket exists: %w", err)
	}

	logger.WithFields(logrus.Fields{
		"endpoint": cfg.MinIO.Endpoint,
		"bucket":   cfg.MinIO.BucketName,
		"ssl":      cfg.MinIO.UseSSL,
	}).Info("MinIO service initialized successfully")

	return service, nil
}

// ensureBucketExists creates the bucket if it doesn't exist
func (s *MinIOService) ensureBucketExists(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return fmt.Errorf("failed to check if bucket exists: %w", err)
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{
			Region: "us-east-1",
		})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}
		s.logger.WithField("bucket", s.bucketName).Info("Created MinIO bucket")
	}

	return nil
}

// UploadVideo uploads a video file to MinIO
func (s *MinIOService) UploadVideo(ctx context.Context, reader io.Reader, fileInfo *models.FileInfo) (string, error) {
	// Generate unique object ID
	objectID := s.generateObjectID(fileInfo.OriginalName)
	
	// Set content type
	contentType := fileInfo.ContentType
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Upload options
	uploadOptions := minio.PutObjectOptions{
		ContentType: contentType,
		UserMetadata: map[string]string{
			"original-name": fileInfo.OriginalName,
			"file-size":     fmt.Sprintf("%d", fileInfo.Size),
			"uploaded-at":   time.Now().UTC().Format(time.RFC3339),
		},
	}

	// Upload the file
	uploadInfo, err := s.client.PutObject(ctx, s.bucketName, objectID, reader, fileInfo.Size, uploadOptions)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"object_id": objectID,
			"error":     err.Error(),
		}).Error("Failed to upload video to MinIO")
		return "", fmt.Errorf("failed to upload video: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"object_id":     objectID,
		"bucket":        s.bucketName,
		"size":          uploadInfo.Size,
		"etag":          uploadInfo.ETag,
		"original_name": fileInfo.OriginalName,
	}).Info("Successfully uploaded video to MinIO")

	return objectID, nil
}

// GetVideoURL generates a presigned URL for video access
func (s *MinIOService) GetVideoURL(ctx context.Context, objectID string, expiry time.Duration) (string, error) {
	url, err := s.client.PresignedGetObject(ctx, s.bucketName, objectID, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}
	return url.String(), nil
}

// DeleteVideo deletes a video from MinIO
func (s *MinIOService) DeleteVideo(ctx context.Context, objectID string) error {
	err := s.client.RemoveObject(ctx, s.bucketName, objectID, minio.RemoveObjectOptions{})
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"object_id": objectID,
			"error":     err.Error(),
		}).Error("Failed to delete video from MinIO")
		return fmt.Errorf("failed to delete video: %w", err)
	}

	s.logger.WithField("object_id", objectID).Info("Successfully deleted video from MinIO")
	return nil
}

// GetVideoInfo retrieves video information from MinIO
func (s *MinIOService) GetVideoInfo(ctx context.Context, objectID string) (*minio.ObjectInfo, error) {
	info, err := s.client.StatObject(ctx, s.bucketName, objectID, minio.StatObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get video info: %w", err)
	}
	return &info, nil
}

// HealthCheck checks MinIO connectivity
func (s *MinIOService) HealthCheck(ctx context.Context) error {
	// Try to list buckets to check connectivity
	_, err := s.client.ListBuckets(ctx)
	if err != nil {
		return fmt.Errorf("MinIO health check failed: %w", err)
	}
	return nil
}

// generateObjectID generates a unique object ID for the video
func (s *MinIOService) generateObjectID(originalName string) string {
	// Generate UUID
	id := uuid.New().String()
	
	// Get file extension
	ext := filepath.Ext(originalName)
	if ext == "" {
		ext = ".mp4" // default extension
	}
	
	// Create object ID with timestamp and UUID
	timestamp := time.Now().UTC().Format("2006/01/02")
	objectID := fmt.Sprintf("videos/%s/%s%s", timestamp, id, strings.ToLower(ext))
	
	return objectID
}

// ListVideos lists videos in the bucket (for debugging/admin purposes)
func (s *MinIOService) ListVideos(ctx context.Context, prefix string) ([]minio.ObjectInfo, error) {
	var objects []minio.ObjectInfo
	
	objectCh := s.client.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})
	
	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("error listing objects: %w", object.Err)
		}
		objects = append(objects, object)
	}
	
	return objects, nil
}
