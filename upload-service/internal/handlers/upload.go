package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"

	"vidflow/upload-service/internal/config"
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
	Success bool   `json:"success"`
	VideoID string `json:"video_id,omitempty"`
	Message string `json:"message"`
	Status  string `json:"status,omitempty"`
	FileURL string `json:"file_url,omitempty"`
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

	// Upload file to MinIO
	ctx := context.Background()
	fileURL, err := h.minioService.UploadFile(ctx, file, fileHeader, objectName)
	if err != nil {
		h.logger.WithError(err).Error("Failed to upload file to MinIO")
		h.sendErrorResponse(w, "Failed to upload file to storage", "STORAGE_ERROR", http.StatusInternalServerError)
		return
	}

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

	// Publish message to RabbitMQ for video processing
	if err := h.rabbitmqService.PublishVideoProcessingMessage(ctx, fileURL); err != nil {
		h.logger.WithError(err).Error("Failed to publish video processing message")
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
		Success: true,
		VideoID: videoID,
		Message: "Video uploaded successfully and processing initiated",
		Status:  "processing",
		FileURL: fileURL,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)

	_ = grpcResponse // Use the gRPC response as needed
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
