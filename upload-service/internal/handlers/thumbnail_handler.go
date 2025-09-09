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

// ThumbnailHandler handles thumbnail upload requests
type ThumbnailHandler struct {
	minioService *services.MinIOService
	grpcService  *services.GRPCService
	config       *config.Config
	logger       *logrus.Logger
}

// NewThumbnailHandler creates a new thumbnail handler
func NewThumbnailHandler(
	minioService *services.MinIOService,
	grpcService *services.GRPCService,
	config *config.Config,
	logger *logrus.Logger,
) *ThumbnailHandler {
	return &ThumbnailHandler{
		minioService: minioService,
		grpcService:  grpcService,
		config:       config,
		logger:       logger,
	}
}

// UploadThumbnail handles thumbnail upload requests
// @Summary Upload a thumbnail image
// @Description Upload a thumbnail image for a video to MinIO storage
// @Tags Thumbnail
// @Accept multipart/form-data
// @Produce json
// @Param thumbnail formData file true "Thumbnail image file to upload"
// @Param video_id formData string true "Video ID to associate thumbnail with"
// @Success 201 {object} models.ThumbnailUploadResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 413 {object} models.ErrorResponse "Request Entity Too Large"
// @Failure 429 {object} models.ErrorResponse "Too Many Requests"
// @Failure 500 {object} models.ErrorResponse
// @Router /api/upload/thumbnail [post]
func (h *ThumbnailHandler) UploadThumbnail(c *gin.Context) {
	startTime := time.Now()

	// Parse multipart form
	err := c.Request.ParseMultipartForm(h.config.Upload.MaxThumbnailSize)
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
	videoID := c.PostForm("video_id")

	// Validate required fields
	if videoID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Missing required field",
			Code:    http.StatusBadRequest,
			Message: "video_id is required",
		})
		return
	}

	// Get uploaded file
	file, header, err := c.Request.FormFile("thumbnail")
	if err != nil {
		h.logger.WithError(err).Error("Failed to get uploaded thumbnail file")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "No file uploaded",
			Code:    http.StatusBadRequest,
			Message: "Please select a thumbnail image to upload",
		})
		return
	}
	defer file.Close()

	// Validate file
	fileInfo, err := h.validateThumbnailFile(file, header)
	if err != nil {
		h.logger.WithError(err).Error("Thumbnail file validation failed")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid file",
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	h.logger.WithFields(logrus.Fields{
		"video_id":      videoID,
		"original_name": fileInfo.OriginalName,
		"size":          fileInfo.Size,
		"content_type":  fileInfo.ContentType,
	}).Info("Starting thumbnail upload process")

	// Reset file reader
	file.Seek(0, 0)

	// Upload to MinIO
	objectID, err := h.minioService.UploadThumbnail(c.Request.Context(), file, fileInfo, videoID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to upload thumbnail to MinIO")
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Upload failed",
			Code:    http.StatusInternalServerError,
			Message: "Failed to upload thumbnail to storage",
		})
		return
	}

	// Update video record via gRPC
	err = h.grpcService.UploadThumbnail(c.Request.Context(), videoID, objectID, fileInfo.OriginalName, fileInfo.Size, fileInfo.ContentType)
	if err != nil {
		h.logger.WithError(err).Error("Failed to update video record with thumbnail")

		// Try to cleanup uploaded file
		if cleanupErr := h.minioService.DeleteThumbnail(c.Request.Context(), objectID); cleanupErr != nil {
			h.logger.WithError(cleanupErr).Error("Failed to cleanup uploaded thumbnail after gRPC error")
		}

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Database error",
			Code:    http.StatusInternalServerError,
			Message: "Failed to update video record with thumbnail",
		})
		return
	}

	duration := time.Since(startTime)

	// Return success response
	response := models.ThumbnailUploadResponse{
		VideoID:   videoID,
		ObjectID:  objectID,
		Message:   "Thumbnail uploaded successfully",
		CreatedAt: time.Now(),
	}

	h.logger.WithFields(logrus.Fields{
		"video_id":  videoID,
		"object_id": objectID,
		"duration":  duration,
	}).Info("Thumbnail upload completed successfully")

	c.JSON(http.StatusCreated, response)
}

// validateThumbnailFile validates the uploaded thumbnail file
func (h *ThumbnailHandler) validateThumbnailFile(file multipart.File, header *multipart.FileHeader) (*models.FileInfo, error) {
	// Check file size
	if header.Size > h.config.Upload.MaxThumbnailSize {
		return nil, fmt.Errorf("file size %d exceeds maximum allowed size %d", header.Size, h.config.Upload.MaxThumbnailSize)
	}

	if header.Size == 0 {
		return nil, fmt.Errorf("file is empty")
	}

	// Get content type
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		// Try to detect content type from file extension
		ext := strings.ToLower(filepath.Ext(header.Filename))
		contentType = getThumbnailContentTypeFromExtension(ext)
	}

	// Validate content type
	if !h.isAllowedThumbnailContentType(contentType) {
		return nil, fmt.Errorf("file type %s is not allowed for thumbnails", contentType)
	}

	// Read first 512 bytes to detect actual content type
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return nil, fmt.Errorf("failed to read file for content type detection: %w", err)
	}

	detectedType := http.DetectContentType(buffer[:n])
	if !strings.HasPrefix(detectedType, "image/") && !strings.Contains(detectedType, "octet-stream") {
		return nil, fmt.Errorf("file does not appear to be an image file (detected: %s)", detectedType)
	}

	return &models.FileInfo{
		OriginalName: header.Filename,
		Size:         header.Size,
		ContentType:  contentType,
		Extension:    filepath.Ext(header.Filename),
	}, nil
}

// isAllowedThumbnailContentType checks if the content type is allowed for thumbnails
func (h *ThumbnailHandler) isAllowedThumbnailContentType(contentType string) bool {
	for _, allowed := range h.config.Upload.AllowedThumbnailTypes {
		if contentType == allowed {
			return true
		}
	}
	return false
}

// getThumbnailContentTypeFromExtension returns content type based on file extension for thumbnails
func getThumbnailContentTypeFromExtension(ext string) string {
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	default:
		return "application/octet-stream"
	}
}

// GetThumbnailStatus returns the status of a thumbnail
// @Summary Get thumbnail status
// @Description Get the current status and information of a video's thumbnail
// @Tags Thumbnail
// @Accept json
// @Produce json
// @Param video_id path string true "Video ID"
// @Success 200 {object} docs.ThumbnailStatusResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/upload/thumbnail/{video_id} [get]
func (h *ThumbnailHandler) GetThumbnailStatus(c *gin.Context) {
	videoID := c.Param("video_id")
	if videoID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Missing parameter",
			Code:    http.StatusBadRequest,
			Message: "video_id parameter is required",
		})
		return
	}

	// Get thumbnail info via gRPC
	thumbnailInfo, err := h.grpcService.GetThumbnail(c.Request.Context(), videoID)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get thumbnail info")
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to get thumbnail info",
			Code:    http.StatusInternalServerError,
			Message: "Could not retrieve thumbnail information",
		})
		return
	}

	c.JSON(http.StatusOK, thumbnailInfo)
}
