package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"vidflow/upload-service/internal/config"
	"vidflow/upload-service/internal/models"
	"vidflow/upload-service/internal/services"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// UploadHandler handles video file uploads
type UploadHandler struct {
	config          *config.Config
	grpcClient      *services.GRPCClient
	minioService    *services.MinIOService
	rabbitmqService *services.RabbitMQService
	logger          *logrus.Logger
}

// NewUploadHandler creates a new upload handler
func NewUploadHandler(cfg *config.Config, grpcClient *services.GRPCClient, minioService *services.MinIOService, rabbitmqService *services.RabbitMQService, logger *logrus.Logger) *UploadHandler {
	return &UploadHandler{
		config:          cfg,
		grpcClient:      grpcClient,
		minioService:    minioService,
		rabbitmqService: rabbitmqService,
		logger:          logger,
	}
}

// UploadResponse represents the response for successful uploads
type UploadResponse struct {
	Success           bool       `json:"success"`
	VideoID           string     `json:"video_id,omitempty"`
	Message           string     `json:"message"`
	Status            string     `json:"status,omitempty"`
	FileURL           string     `json:"file_url,omitempty"` // Deprecated: use SignedDownloadURL
	SignedDownloadURL string     `json:"signed_download_url,omitempty"`
	ExpiresAt         *time.Time `json:"expires_at,omitempty"`
	ObjectName        string     `json:"object_name,omitempty"`
}

// ErrorResponse represents error responses
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
}

// HandleUpload processes video file uploads
func (h *UploadHandler) HandleUpload(w http.ResponseWriter, r *http.Request) {
	// Set response headers
	w.Header().Set("Content-Type", "application/json")

	// Parse multipart form
	err := r.ParseMultipartForm(h.config.MaxFileSize)
	if err != nil {
		h.logger.WithError(err).Error("Failed to parse multipart form")
		h.sendErrorResponse(w, "Failed to parse upload form", "PARSE_ERROR", http.StatusBadRequest)
		return
	}

	// Get file from form
	file, fileHeader, err := r.FormFile("video")
	if err != nil {
		h.logger.WithError(err).Error("Failed to get video file from form")
		h.sendErrorResponse(w, "Video file is required", "MISSING_FILE", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file
	if err := h.validateFile(file, fileHeader); err != nil {
		h.logger.WithError(err).Error("File validation failed")
		h.sendErrorResponse(w, err.Error(), "VALIDATION_ERROR", http.StatusBadRequest)
		return
	}

	// Get additional form data
	userID := r.FormValue("user_id")
	description := r.FormValue("description")

	if userID == "" {
		h.sendErrorResponse(w, "User ID is required", "MISSING_USER_ID", http.StatusBadRequest)
		return
	}

	// Generate unique filename
	videoID := uuid.New().String()
	objectName := h.minioService.GenerateObjectName(fileHeader.Filename, videoID)

	// Upload file to MinIO and get signed URL
	ctx := context.Background()
	objectName, signedURL, expiresAt, err := h.minioService.UploadFileWithSignedURL(ctx, file, fileHeader, objectName)
	if err != nil {
		h.logger.WithError(err).Error("Failed to upload file to MinIO")
		h.sendErrorResponse(w, "Failed to upload file to storage", "STORAGE_ERROR", http.StatusInternalServerError)
		return
	}

	// Generate legacy file URL for backward compatibility
	fileURL := signedURL.String()

	// Call main service via gRPC
	grpcResponse, err := h.grpcClient.CreateVideo(ctx, fileURL, userID, description)
	if err != nil {
		// Clean up file from MinIO on gRPC failure
		if deleteErr := h.minioService.DeleteFile(ctx, objectName); deleteErr != nil {
			h.logger.WithError(deleteErr).Error("Failed to cleanup file from MinIO after gRPC failure")
		}
		h.logger.WithError(err).Error("Failed to create video via gRPC")
		h.sendErrorResponse(w, "Failed to process video", "PROCESSING_ERROR", http.StatusInternalServerError)
		return
	}

	// Publish enhanced message to RabbitMQ for video processing
	processingMessage := &models.VideoProcessingMessage{
		VideoID:          videoID,
		SignedURL:        signedURL.String(),
		ExpiresAt:        expiresAt,
		ObjectName:       objectName,
		UserID:           userID,
		Description:      description,
		OriginalFilename: fileHeader.Filename,
		ProcessingOptions: models.ProcessingOptions{
			Qualities:       []string{"144p", "360p", "720p"}, // Default qualities
			OutputFormat:    "hls",
			SegmentDuration: 10, // 10 seconds per segment
		},
	}

	if err := h.rabbitmqService.PublishVideoProcessingMessageV2(ctx, processingMessage); err != nil {
		h.logger.WithError(err).Error("Failed to publish enhanced video processing message")
		// Note: We don't fail the request here as the video is already uploaded and recorded
		// The processing can be retried later or handled manually
	}

	h.logger.WithFields(logrus.Fields{
		"video_id":    videoID,
		"user_id":     userID,
		"filename":    fileHeader.Filename,
		"file_size":   fileHeader.Size,
		"description": description,
		"file_url":    fileURL,
	}).Info("Video uploaded and processing initiated successfully")

	// Send success response
	response := UploadResponse{
		Success:           true,
		VideoID:           videoID,
		Message:           "Video uploaded successfully and processing initiated",
		Status:            "processing",
		FileURL:           fileURL, // Deprecated but kept for backward compatibility
		SignedDownloadURL: signedURL.String(),
		ExpiresAt:         &expiresAt,
		ObjectName:        objectName,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)

	_ = grpcResponse // Use the gRPC response as needed
}

// SignedURLRequest represents the request for generating signed URLs
type SignedURLRequest struct {
	ObjectName  string `json:"object_name"`
	VideoID     string `json:"video_id"`
	ExpiryHours int    `json:"expiry_hours,omitempty"` // Optional custom expiry in hours
}

// SignedURLResponse represents the response for signed URL generation
type SignedURLResponse struct {
	Success           bool       `json:"success"`
	SignedDownloadURL string     `json:"signed_download_url"`
	ExpiresAt         *time.Time `json:"expires_at"`
	ObjectName        string     `json:"object_name"`
	VideoID           string     `json:"video_id,omitempty"`
}

// HandleGenerateSignedURL generates a new signed URL for an existing video
func (h *UploadHandler) HandleGenerateSignedURL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req SignedURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.WithError(err).Error("Failed to decode signed URL request")
		h.sendErrorResponse(w, "Invalid request body", "INVALID_REQUEST", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.ObjectName == "" && req.VideoID == "" {
		h.sendErrorResponse(w, "Either object_name or video_id is required", "MISSING_IDENTIFIER", http.StatusBadRequest)
		return
	}

	// If video_id is provided but object_name is not, we need to construct it
	objectName := req.ObjectName
	if objectName == "" && req.VideoID != "" {
		// Assume the object name follows the pattern: {video_id}.{extension}
		// In a real implementation, you might need to query the database for the actual object name
		objectName = req.VideoID + ".mp4" // Default extension, should be retrieved from database
	}

	// Calculate expiry duration
	var expiry time.Duration
	if req.ExpiryHours > 0 {
		expiry = time.Duration(req.ExpiryHours) * time.Hour
	} else {
		expiry = time.Duration(h.config.SignedURLDownloadExpiry) * time.Second
	}

	// Generate signed URL
	ctx := context.Background()
	signedURL, err := h.minioService.GeneratePresignedGetURL(ctx, objectName, expiry)
	if err != nil {
		h.logger.WithError(err).WithFields(logrus.Fields{
			"object_name": objectName,
			"video_id":    req.VideoID,
		}).Error("Failed to generate signed URL")
		h.sendErrorResponse(w, "Failed to generate signed URL", "URL_GENERATION_ERROR", http.StatusInternalServerError)
		return
	}

	expiresAt := time.Now().UTC().Add(expiry)

	response := SignedURLResponse{
		Success:           true,
		SignedDownloadURL: signedURL.String(),
		ExpiresAt:         &expiresAt,
		ObjectName:        objectName,
		VideoID:           req.VideoID,
	}

	h.logger.WithFields(logrus.Fields{
		"object_name": objectName,
		"video_id":    req.VideoID,
		"signed_url":  signedURL.String(),
		"expires_at":  expiresAt,
	}).Info("Generated signed URL successfully")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// validateFile validates the uploaded file
func (h *UploadHandler) validateFile(file multipart.File, header *multipart.FileHeader) error {
	// Check file size
	if header.Size > h.config.MaxFileSize {
		return fmt.Errorf("file size %d exceeds maximum allowed size %d", header.Size, h.config.MaxFileSize)
	}

	// Check file type by reading the first 512 bytes
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		return fmt.Errorf("failed to read file for type detection: %w", err)
	}

	// Reset file pointer
	file.Seek(0, 0)

	// Detect MIME type
	mimeType := http.DetectContentType(buffer)

	// Check if MIME type is allowed
	allowed := false
	for _, allowedType := range h.config.AllowedFileTypes {
		if strings.EqualFold(mimeType, allowedType) {
			allowed = true
			break
		}
	}

	if !allowed {
		return fmt.Errorf("file type %s is not allowed. Allowed types: %v", mimeType, h.config.AllowedFileTypes)
	}

	return nil
}

// sendErrorResponse sends a JSON error response
func (h *UploadHandler) sendErrorResponse(w http.ResponseWriter, message, code string, statusCode int) {
	response := ErrorResponse{
		Success: false,
		Error:   message,
		Code:    code,
	}

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
