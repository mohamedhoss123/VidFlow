package services

import (
	"context"
	"fmt"
	"time"
	"upload-service/internal/config"
	thumbnailpb "upload-service/proto/thumbnail"
	videopb "upload-service/proto/video"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
)

// GRPCService handles gRPC communication with main-service
type GRPCService struct {
	videoClient     videopb.VideoServiceClient
	thumbnailClient thumbnailpb.ThumbnailServiceClient
	conn            *grpc.ClientConn
	timeout         time.Duration
	logger          *logrus.Logger
}

// NewGRPCService creates a new gRPC service instance
func NewGRPCService(cfg *config.Config, logger *logrus.Logger) (*GRPCService, error) {
	// Set up connection options
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithKeepaliveParams(keepalive.ClientParameters{
			Time:                10 * time.Second,
			Timeout:             time.Second,
			PermitWithoutStream: true,
		}),
	}

	// Connect to main-service
	conn, err := grpc.Dial(cfg.GRPC.MainServiceAddress, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to main-service: %w", err)
	}

	// Create clients
	videoClient := videopb.NewVideoServiceClient(conn)
	thumbnailClient := thumbnailpb.NewThumbnailServiceClient(conn)

	service := &GRPCService{
		videoClient:     videoClient,
		thumbnailClient: thumbnailClient,
		conn:            conn,
		timeout:         time.Duration(cfg.GRPC.Timeout) * time.Second,
		logger:          logger,
	}

	logger.WithFields(logrus.Fields{
		"address": cfg.GRPC.MainServiceAddress,
		"timeout": service.timeout,
	}).Info("gRPC service initialized successfully")

	return service, nil
}

// CreateVideo creates a video record in the main-service
func (s *GRPCService) CreateVideo(ctx context.Context, userID, url, description string) (string, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	// Prepare request
	req := &videopb.CreateVideoRequest{
		UserId:      userID,
		Url:         url,
		Description: description,
	}

	// Make gRPC call
	resp, err := s.videoClient.CreateVideo(ctx, req)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"user_id":     userID,
			"url":         url,
			"description": description,
			"error":       err.Error(),
		}).Error("Failed to create video via gRPC")
		return "", fmt.Errorf("failed to create video: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"user_id":     userID,
		"video_id":    resp.VideoId,
		"url":         url,
		"description": description,
	}).Info("Successfully created video via gRPC")

	return resp.VideoId, nil
}

// MakeVideoReady marks a video as ready with quality information
func (s *GRPCService) MakeVideoReady(ctx context.Context, videoID string, length int32, qualities []*videopb.VideoQuality) error {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	// Prepare request
	req := &videopb.VideoReadyRequest{
		VideoId: videoID,
		Length:  length,
		Quality: qualities,
	}

	// Make gRPC call
	_, err := s.videoClient.MakeVideoReady(ctx, req)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"video_id":        videoID,
			"length":          length,
			"qualities_count": len(qualities),
			"error":           err.Error(),
		}).Error("Failed to make video ready via gRPC")
		return fmt.Errorf("failed to make video ready: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"video_id":        videoID,
		"length":          length,
		"qualities_count": len(qualities),
	}).Info("Successfully marked video as ready via gRPC")

	return nil
}

// HealthCheck checks gRPC connectivity
func (s *GRPCService) HealthCheck(ctx context.Context) error {
	if s.conn == nil {
		return fmt.Errorf("gRPC connection is nil")
	}

	// Check connection state
	state := s.conn.GetState()
	if state.String() == "SHUTDOWN" {
		return fmt.Errorf("gRPC connection is shutdown")
	}

	// Try to make a simple call with a very short timeout
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// We can't make a real call without valid data, so we just check the connection state
	// In a real scenario, you might want to implement a health check endpoint in the main-service
	return nil
}

// Close closes the gRPC connection
func (s *GRPCService) Close() error {
	if s.conn != nil {
		err := s.conn.Close()
		if err != nil {
			s.logger.WithError(err).Error("Failed to close gRPC connection")
			return fmt.Errorf("failed to close gRPC connection: %w", err)
		}
		s.logger.Info("gRPC service closed successfully")
	}
	return nil
}

// Reconnect attempts to reconnect to the main-service
func (s *GRPCService) Reconnect(cfg *config.Config) error {
	s.logger.Info("Attempting to reconnect to main-service...")

	// Close existing connection
	if s.conn != nil {
		s.conn.Close()
	}

	// Set up connection options
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithKeepaliveParams(keepalive.ClientParameters{
			Time:                10 * time.Second,
			Timeout:             time.Second,
			PermitWithoutStream: true,
		}),
	}

	// Reconnect
	conn, err := grpc.Dial(cfg.GRPC.MainServiceAddress, opts...)
	if err != nil {
		return fmt.Errorf("failed to reconnect to main-service: %w", err)
	}

	// Update service
	s.conn = conn
	s.videoClient = videopb.NewVideoServiceClient(conn)
	s.thumbnailClient = thumbnailpb.NewThumbnailServiceClient(conn)

	s.logger.Info("Successfully reconnected to main-service")
	return nil
}

// UploadThumbnail uploads thumbnail information via gRPC
func (s *GRPCService) UploadThumbnail(ctx context.Context, videoID, objectID, originalFilename string, fileSize int64, contentType string) error {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	// Prepare request
	req := &thumbnailpb.UploadThumbnailRequest{
		VideoId:           videoID,
		ThumbnailObjectId: objectID,
		OriginalFilename:  originalFilename,
		FileSize:          fileSize,
		ContentType:       contentType,
	}

	// Make gRPC call
	resp, err := s.thumbnailClient.UploadThumbnail(ctx, req)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"video_id":  videoID,
			"object_id": objectID,
			"error":     err.Error(),
		}).Error("Failed to upload thumbnail via gRPC")
		return fmt.Errorf("failed to upload thumbnail: %w", err)
	}

	if !resp.Success {
		s.logger.WithFields(logrus.Fields{
			"video_id":  videoID,
			"object_id": objectID,
			"message":   resp.Message,
		}).Error("Thumbnail upload failed")
		return fmt.Errorf("thumbnail upload failed: %s", resp.Message)
	}

	s.logger.WithFields(logrus.Fields{
		"video_id":  videoID,
		"object_id": objectID,
		"message":   resp.Message,
	}).Info("Successfully uploaded thumbnail via gRPC")

	return nil
}

// GetThumbnail retrieves thumbnail information via gRPC
func (s *GRPCService) GetThumbnail(ctx context.Context, videoID string) (*thumbnailpb.GetThumbnailResponse, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	// Prepare request
	req := &thumbnailpb.GetThumbnailRequest{
		VideoId: videoID,
	}

	// Make gRPC call
	resp, err := s.thumbnailClient.GetThumbnail(ctx, req)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"video_id": videoID,
			"error":    err.Error(),
		}).Error("Failed to get thumbnail via gRPC")
		return nil, fmt.Errorf("failed to get thumbnail: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"video_id":      videoID,
		"has_thumbnail": resp.HasThumbnail,
	}).Info("Successfully retrieved thumbnail info via gRPC")

	return resp, nil
}
