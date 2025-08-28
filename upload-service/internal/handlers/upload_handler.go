package handlers

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"
	"upload-service/internal/config"
	"upload-service/internal/models"
	"upload-service/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// UploadHandler handles video upload requests
type UploadHandler struct {
	minioService    *services.MinIOService
	grpcService     *services.GRPCService
	rabbitmqService *services.RabbitMQService
	config          *config.Config
	logger          *logrus.Logger
}

// NewUploadHandler creates a new upload handler
func NewUploadHandler(
	minioService *services.MinIOService,
	grpcService *services.GRPCService,
	rabbitmqService *services.RabbitMQService,
	config *config.Config,
	logger *logrus.Logger,
) *UploadHandler {
	return &UploadHandler{
		minioService:    minioService,
		grpcService:     grpcService,
		rabbitmqService: rabbitmqService,
		config:          config,
		logger:          logger,
	}
}

// UploadVideo handles video upload requests
func (h *UploadHandler) UploadVideo(c *gin.Context) {
	startTime := time.Now()

	// Parse multipart form
	err := c.Request.ParseMultipartForm(h.config.Upload.MaxFileSize)
	if err != nil {
		h.logger.WithError(err).Error("Failed to parse multipart form")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid form data",
			Code:    http.StatusBadRequest,
			Message: "Failed to parse multipart form",
		})
		return
	}

	// Get form values
	userID := c.PostForm("user_id")
	description := c.PostForm("description")
	name := c.PostForm("name")

	// Validate required fields
	if userID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Missing required field",
			Code:    http.StatusBadRequest,
			Message: "user_id is required",
		})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("video")
	if err != nil {
		h.logger.WithError(err).Error("Failed to get uploaded file")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "No file uploaded",
			Code:    http.StatusBadRequest,
			Message: "Please select a video file to upload",
		})
		return
	}
	defer file.Close()

	// Validate file
	fileInfo, err := h.validateFile(file, header)
	if err != nil {
		h.logger.WithError(err).Error("File validation failed")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid file",
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// Set name if not provided
	if name == "" {
		name = strings.TrimSuffix(fileInfo.OriginalName, filepath.Ext(fileInfo.OriginalName))
	}

	h.logger.WithFields(logrus.Fields{
		"user_id":       userID,
		"original_name": fileInfo.OriginalName,
		"size":          fileInfo.Size,
		"content_type":  fileInfo.ContentType,
		"name":          name,
		"description":   description,
	}).Info("Starting video upload process")

	// Reset file reader
	file.Seek(0, 0)

	// Upload to MinIO
	objectID, err := h.minioService.UploadVideo(c.Request.Context(), file, fileInfo)
	if err != nil {
		h.logger.WithError(err).Error("Failed to upload video to MinIO")
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Upload failed",
			Code:    http.StatusInternalServerError,
			Message: "Failed to upload video to storage",
		})
		return
	}

	// Create video record via gRPC
	videoID, err := h.grpcService.CreateVideo(c.Request.Context(), userID, name, description)
	if err != nil {
		h.logger.WithError(err).Error("Failed to create video record")

		// Try to cleanup uploaded file
		if cleanupErr := h.minioService.DeleteVideo(c.Request.Context(), objectID); cleanupErr != nil {
			h.logger.WithError(cleanupErr).Error("Failed to cleanup uploaded file after gRPC error")
		}

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Database error",
			Code:    http.StatusInternalServerError,
			Message: "Failed to create video record",
		})
		return
	}

	// Send message to RabbitMQ for processing
	err = h.rabbitmqService.PublishVideoProcessingMessage(c.Request.Context(), videoID, objectID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to publish processing message")
		// Note: We don't cleanup here as the video record is already created
		// The processing can be retried later
	}

	duration := time.Since(startTime)

	// Return success response
	response := models.UploadResponse{
		VideoID:   videoID,
		ObjectID:  objectID,
		Message:   "Video uploaded successfully and processing started",
		Status:    "processing",
		CreatedAt: time.Now(),
	}

	h.logger.WithFields(logrus.Fields{
		"video_id":  videoID,
		"object_id": objectID,
		"user_id":   userID,
		"duration":  duration,
	}).Info("Video upload completed successfully")

	c.JSON(http.StatusCreated, response)
}

// validateFile validates the uploaded file
func (h *UploadHandler) validateFile(file multipart.File, header *multipart.FileHeader) (*models.FileInfo, error) {
	// Check file size
	if header.Size > h.config.Upload.MaxFileSize {
		return nil, fmt.Errorf("file size %d exceeds maximum allowed size %d", header.Size, h.config.Upload.MaxFileSize)
	}

	if header.Size == 0 {
		return nil, fmt.Errorf("file is empty")
	}

	// Get content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		// Try to detect content type from file extension
		ext := strings.ToLower(filepath.Ext(header.Filename))
		contentType = getContentTypeFromExtension(ext)
	}

	// Validate content type
	if !h.isAllowedContentType(contentType) {
		return nil, fmt.Errorf("file type %s is not allowed", contentType)
	}

	// Read first 512 bytes to detect actual content type
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return nil, fmt.Errorf("failed to read file for content type detection: %w", err)
	}

	detectedType := http.DetectContentType(buffer[:n])
	if !strings.HasPrefix(detectedType, "video/") && !strings.Contains(detectedType, "octet-stream") {
		return nil, fmt.Errorf("file does not appear to be a video file (detected: %s)", detectedType)
	}

	return &models.FileInfo{
		OriginalName: header.Filename,
		Size:         header.Size,
		ContentType:  contentType,
		Extension:    filepath.Ext(header.Filename),
	}, nil
}

// isAllowedContentType checks if the content type is allowed
func (h *UploadHandler) isAllowedContentType(contentType string) bool {
	for _, allowed := range h.config.Upload.AllowedTypes {
		if contentType == allowed {
			return true
		}
	}
	return false
}

// getContentTypeFromExtension returns content type based on file extension
func getContentTypeFromExtension(ext string) string {
	switch ext {
	case ".mp4":
		return "video/mp4"
	case ".avi":
		return "video/avi"
	case ".mov":
		return "video/mov"
	case ".wmv":
		return "video/wmv"
	case ".flv":
		return "video/flv"
	case ".webm":
		return "video/webm"
	case ".mkv":
		return "video/mkv"
	default:
		return "application/octet-stream"
	}
}

// GetUploadStatus returns the status of an upload
func (h *UploadHandler) GetUploadStatus(c *gin.Context) {
	videoID := c.Param("video_id")
	if videoID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Missing parameter",
			Code:    http.StatusBadRequest,
			Message: "video_id parameter is required",
		})
		return
	}

	// For now, return a simple status
	// In a real implementation, you might query the main-service for actual status
	c.JSON(http.StatusOK, gin.H{
		"video_id": videoID,
		"status":   "processing",
		"message":  "Video is being processed",
	})
}

// GetUploadLimits returns the upload limits and allowed file types
func (h *UploadHandler) GetUploadLimits(c *gin.Context) {
	limits := gin.H{
		"max_file_size":    h.config.Upload.MaxFileSize,
		"allowed_types":    h.config.Upload.AllowedTypes,
		"max_file_size_mb": h.config.Upload.MaxFileSize / (1024 * 1024),
	}

	c.JSON(http.StatusOK, limits)
}
