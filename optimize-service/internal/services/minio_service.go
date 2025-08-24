package services

import (
	"context"
	"fmt"
	"optimize-service/internal/config"
	"os"
	"sync"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/sirupsen/logrus"
)

// MinIOService handles MinIO object storage operations for optimization service
type MinIOService struct {
	Client     *minio.Client
	BucketName string
	logger     *logrus.Logger
	endpoint   string
	useSSL     bool
	config     *config.Config
}

var (
	service *MinIOService
	once    sync.Once
)

// NewMinIOService creates a new MinIO service instance
func GetMinIOService(cfg *config.Config, logger *logrus.Logger) (*MinIOService, error) {
	once.Do(func() {
		// Initialize MinIO client
		client, err := minio.New(cfg.MinIOEndpoint, &minio.Options{
			Creds:  credentials.NewStaticV4(cfg.MinIOAccessKey, cfg.MinIOSecretKey, ""),
			Secure: cfg.MinIOUseSSL,
		})
		if err != nil {
			panic(err)
		}

		service = &MinIOService{
			Client:     client,
			BucketName: cfg.MinIOBucketName,
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
	})
	return service, nil
}

// HealthCheck performs a health check on the MinIO service
func (m *MinIOService) HealthCheck(ctx context.Context) error {
	healthCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Check if bucket exists as a simple health check
	_, err := m.Client.BucketExists(healthCtx, m.BucketName)
	if err != nil {
		m.logger.WithError(err).Warn("MinIO health check failed")
		return fmt.Errorf("MinIO health check failed: %w", err)
	}

	return nil
}

func (m *MinIOService) DownloadVideo(objectId string) (string, error) {
	filePath := "./video/" + objectId
	err := m.Client.FGetObject(
		context.Background(),
		m.BucketName,
		objectId,
		filePath,
		minio.GetObjectOptions{},
	)

	if err != nil {
		logrus.Error(err)
		return "", err
	}

	info, err := os.Stat(filePath)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	fmt.Printf("Successfully downloaded %s (%d bytes)\n", filePath, info.Size())

	return filePath, nil
}

func (m *MinIOService) UploadVideo(file string) {
	_, err := m.Client.FPutObject(context.Background(), m.BucketName, file, "./video/quality/"+file, minio.PutObjectOptions{})
	if err != nil {
		logrus.Error(err)
	}
}
