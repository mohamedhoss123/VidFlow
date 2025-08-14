package util

import (
	"context"
	"fmt"
	"optimize-service/internal/config"
	"optimize-service/internal/models"
	"optimize-service/internal/services"
	"os"
	"path/filepath"
	"time"

	"os/exec"

	"github.com/sirupsen/logrus"
)

// VideoProcessor handles video processing operations
type VideoProcessor struct {
	config       *config.Config
	minioService *services.MinIOService
	logger       *logrus.Logger
}

// NewVideoProcessor creates a new video processor instance
func NewVideoProcessor(cfg *config.Config, minioService *services.MinIOService, logger *logrus.Logger) *VideoProcessor {
	return &VideoProcessor{
		config:       cfg,
		minioService: minioService,
		logger:       logger,
	}
}

// ProcessVideoFromSignedURL processes a video from a signed URL
func (vp *VideoProcessor) ProcessVideoFromSignedURL(ctx context.Context, message *models.VideoProcessingMessage) error {
	vp.logger.WithFields(logrus.Fields{
		"video_id":    message.VideoID,
		"signed_url":  message.SignedURL,
		"object_name": message.ObjectName,
	}).Info("Starting video processing")

	// Create working directory for this video
	workingDir := filepath.Join(vp.config.WorkingDir, message.VideoID)
	if err := os.MkdirAll(workingDir, 0755); err != nil {
		return fmt.Errorf("failed to create working directory: %w", err)
	}
	defer vp.cleanup(workingDir)

	// Download source video
	sourceVideoPath := filepath.Join(workingDir, "source"+filepath.Ext(message.ObjectName))
	if err := vp.minioService.DownloadVideoFromSignedURL(ctx, message.SignedURL, sourceVideoPath); err != nil {
		return fmt.Errorf("failed to download source video: %w", err)
	}

	// Process video for each quality
	for _, quality := range message.ProcessingOptions.Qualities {
		if err := vp.processQuality(ctx, message, sourceVideoPath, workingDir, quality); err != nil {
			vp.logger.WithError(err).WithFields(logrus.Fields{
				"video_id": message.VideoID,
				"quality":  quality,
			}).Error("Failed to process video quality")
			// Continue with other qualities even if one fails
		}
	}

	vp.logger.WithFields(logrus.Fields{
		"video_id": message.VideoID,
	}).Info("Video processing completed")

	return nil
}

// processQuality processes a video for a specific quality
func (vp *VideoProcessor) processQuality(ctx context.Context, message *models.VideoProcessingMessage, sourceVideoPath, workingDir, quality string) error {
	resolution, exists := config.Resolutions[quality]
	if !exists {
		return fmt.Errorf("unsupported quality: %s", quality)
	}

	vp.logger.WithFields(logrus.Fields{
		"video_id": message.VideoID,
		"quality":  quality,
		"width":    resolution.Width,
		"height":   resolution.Height,
		"bitrate":  resolution.VideoBitrate,
	}).Info("Processing video quality")

	// Generate unique ID for this quality variant
	qualityID, err := NewUUIDv7()
	if err != nil {
		return fmt.Errorf("failed to generate quality ID: %w", err)
	}

	// Create quality-specific directory
	qualityDir := filepath.Join(workingDir, quality)
	if err := os.MkdirAll(qualityDir, 0755); err != nil {
		return fmt.Errorf("failed to create quality directory: %w", err)
	}

	// Process based on output format
	switch message.ProcessingOptions.OutputFormat {
	case "hls":
		return vp.processHLS(ctx, message, sourceVideoPath, qualityDir, qualityID, quality, resolution)
	case "mp4":
		return vp.processMP4(ctx, message, sourceVideoPath, qualityDir, qualityID, quality, resolution)
	default:
		return vp.processHLS(ctx, message, sourceVideoPath, qualityDir, qualityID, quality, resolution) // Default to HLS
	}
}

// processHLS processes video to HLS format
func (vp *VideoProcessor) processHLS(ctx context.Context, message *models.VideoProcessingMessage, sourceVideoPath, qualityDir, qualityID, quality string, resolution config.Resolution) error {
	segmentFilename := filepath.Join(qualityDir, fmt.Sprintf("%s-%%03d.ts", qualityID))
	outputM3U8 := filepath.Join(qualityDir, fmt.Sprintf("%s.m3u8", qualityID))

	// Set timeout for processing
	processCtx, cancel := context.WithTimeout(ctx, time.Duration(vp.config.ProcessTimeout)*time.Second)
	defer cancel()

	cmd := exec.CommandContext(processCtx,
		"ffmpeg",
		"-i", sourceVideoPath,
		"-c:v", "h264",
		"-preset", "fast",
		"-b:v", resolution.VideoBitrate,
		"-vf", fmt.Sprintf("scale=%d:%d", resolution.Width, resolution.Height),
		"-hls_time", fmt.Sprintf("%d", message.ProcessingOptions.SegmentDuration),
		"-hls_list_size", "0",
		"-hls_segment_filename", segmentFilename,
		outputM3U8,
	)

	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg processing failed: %w", err)
	}

	// Upload processed files to MinIO
	return vp.uploadProcessedFiles(ctx, message, qualityDir, quality)
}

// processMP4 processes video to MP4 format
func (vp *VideoProcessor) processMP4(ctx context.Context, message *models.VideoProcessingMessage, sourceVideoPath, qualityDir, qualityID, quality string, resolution config.Resolution) error {
	outputMP4 := filepath.Join(qualityDir, fmt.Sprintf("%s.mp4", qualityID))

	// Set timeout for processing
	processCtx, cancel := context.WithTimeout(ctx, time.Duration(vp.config.ProcessTimeout)*time.Second)
	defer cancel()

	cmd := exec.CommandContext(processCtx,
		"ffmpeg",
		"-i", sourceVideoPath,
		"-c:v", "h264",
		"-preset", "fast",
		"-b:v", resolution.VideoBitrate,
		"-vf", fmt.Sprintf("scale=%d:%d", resolution.Width, resolution.Height),
		outputMP4,
	)

	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg processing failed: %w", err)
	}

	// Upload processed file to MinIO
	return vp.uploadProcessedFiles(ctx, message, qualityDir, quality)
}

// uploadProcessedFiles uploads processed video files to MinIO
func (vp *VideoProcessor) uploadProcessedFiles(ctx context.Context, message *models.VideoProcessingMessage, qualityDir, quality string) error {
	// Walk through the quality directory and upload all files
	return filepath.Walk(qualityDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		// Generate object name for MinIO
		relPath, err := filepath.Rel(qualityDir, path)
		if err != nil {
			return err
		}
		objectName := fmt.Sprintf("processed/%s/%s/%s", message.VideoID, quality, relPath)

		// Upload file
		if err := vp.minioService.UploadProcessedVideo(ctx, path, objectName); err != nil {
			vp.logger.WithError(err).WithFields(logrus.Fields{
				"video_id":    message.VideoID,
				"quality":     quality,
				"object_name": objectName,
				"local_path":  path,
			}).Error("Failed to upload processed file")
			return err
		}

		vp.logger.WithFields(logrus.Fields{
			"video_id":    message.VideoID,
			"quality":     quality,
			"object_name": objectName,
			"local_path":  path,
		}).Info("Uploaded processed file successfully")

		return nil
	})
}

// cleanup removes the working directory
func (vp *VideoProcessor) cleanup(workingDir string) {
	if err := os.RemoveAll(workingDir); err != nil {
		vp.logger.WithError(err).WithField("working_dir", workingDir).Warn("Failed to cleanup working directory")
	} else {
		vp.logger.WithField("working_dir", workingDir).Debug("Cleaned up working directory")
	}
}

// Legacy functions removed - replaced by VideoProcessor methods
