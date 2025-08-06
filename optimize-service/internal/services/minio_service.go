package services

import (
	"context"
	"fmt"
	"io"
	"net/http"
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

// DownloadVideoFromSignedURL downloads a video from a signed URL to local storage
func (m *MinIOService) DownloadVideoFromSignedURL(ctx context.Context, signedURL, localPath string) error {
	downloadCtx, cancel := context.WithTimeout(ctx, time.Duration(m.config.ProcessTimeout)*time.Second)
	defer cancel()

	m.logger.WithFields(logrus.Fields{
		"signed_url":  signedURL,
		"local_path":  localPath,
	}).Info("Starting video download from signed URL")

	// Create HTTP request with context
	req, err := http.NewRequestWithContext(downloadCtx, "GET", signedURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create download request: %w", err)
	}

	// Execute request
	client := &http.Client{
		Timeout: time.Duration(m.config.ProcessTimeout) * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to download video: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %d", resp.StatusCode)
	}

	// Create local file
	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	file, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %w", err)
	}
	defer file.Close()

	// Copy content
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to write video content: %w", err)
	}

	m.logger.WithFields(logrus.Fields{
		"signed_url":  signedURL,
		"local_path":  localPath,
	}).Info("Video downloaded successfully")

	return nil
}

// UploadProcessedVideo uploads a processed video file to MinIO
func (m *MinIOService) UploadProcessedVideo(ctx context.Context, localPath, objectName string) error {
	uploadCtx, cancel := context.WithTimeout(ctx, time.Duration(m.config.ProcessTimeout)*time.Second)
	defer cancel()

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
	case ".mp4":
		contentType = "video/mp4"
	case ".m3u8":
		contentType = "application/vnd.apple.mpegurl"
	case ".ts":
		contentType = "video/mp2t"
	}

	// Upload file
	_, err = m.client.PutObject(uploadCtx, m.bucketName, objectName, file, fileInfo.Size(), minio.PutObjectOptions{
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
func (m *MinIOService) GenerateSignedURLForProcessedVideo(ctx context.Context, objectName string) (*url.URL, time.Time, error) {
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
		return nil, time.Time{}, fmt.Errorf("failed to generate presigned GET URL: %w", err)
	}

	expiresAt := time.Now().UTC().Add(expiry)

	m.logger.WithFields(logrus.Fields{
		"object_name":    objectName,
		"bucket":         m.bucketName,
		"expiry":         expiry,
		"presigned_url":  presignedURL.String(),
		"expires_at":     expiresAt,
	}).Info("Generated presigned GET URL for processed video successfully")

	return presignedURL, expiresAt, nil
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
