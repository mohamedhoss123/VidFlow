package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"vidflow/upload-service/internal/config"
	"vidflow/upload-service/internal/services"
)

// UploadHandler handles video file uploads
type UploadHandler struct {
	config     *config.Config
	grpcClient *services.GRPCClient
	logger     *logrus.Logger
}

// NewUploadHandler creates a new upload handler
func NewUploadHandler(cfg *config.Config, grpcClient *services.GRPCClient, logger *logrus.Logger) *UploadHandler {
	return &UploadHandler{
		config:     cfg,
		grpcClient: grpcClient,
		logger:     logger,
	}
}

// UploadResponse represents the response for successful uploads
type UploadResponse struct {
	Success   bool   `json:"success"`
	VideoID   string `json:"video_id,omitempty"`
	Message   string `json:"message"`
	Status    string `json:"status,omitempty"`
	FileURL   string `json:"file_url,omitempty"`
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
	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%s%s", videoID, ext)
	filePath := filepath.Join(h.config.UploadDir, filename)

	// Ensure upload directory exists
	if err := os.MkdirAll(h.config.UploadDir, 0755); err != nil {
		h.logger.WithError(err).Error("Failed to create upload directory")
		h.sendErrorResponse(w, "Failed to prepare upload directory", "STORAGE_ERROR", http.StatusInternalServerError)
		return
	}

	// Save file to temporary location
	if err := h.saveFile(file, filePath); err != nil {
		h.logger.WithError(err).Error("Failed to save uploaded file")
		h.sendErrorResponse(w, "Failed to save uploaded file", "STORAGE_ERROR", http.StatusInternalServerError)
		return
	}

	// Generate file URL (this would be the actual URL where the file can be accessed)
	fileURL := fmt.Sprintf("file://%s", filePath) // Temporary URL format

	// Call main service via gRPC
	ctx := context.Background()
	grpcResponse, err := h.grpcClient.CreateVideo(ctx, fileURL, userID, description)
	if err != nil {
		// Clean up file on gRPC failure
		os.Remove(filePath)
		h.logger.WithError(err).Error("Failed to create video via gRPC")
		h.sendErrorResponse(w, "Failed to process video", "PROCESSING_ERROR", http.StatusInternalServerError)
		return
	}

	h.logger.WithFields(logrus.Fields{
		"video_id":    videoID,
		"user_id":     userID,
		"filename":    fileHeader.Filename,
		"file_size":   fileHeader.Size,
		"description": description,
	}).Info("Video uploaded successfully")

	// Send success response
	response := UploadResponse{
		Success: true,
		VideoID: videoID,
		Message: "Video uploaded successfully",
		Status:  "processing",
		FileURL: fileURL,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)

	// Note: In a production system, you would:
	// 1. Move the file to permanent storage (MinIO/S3)
	// 2. Send a message to RabbitMQ for processing
	// 3. Update the file URL in the database
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

// saveFile saves the uploaded file to the specified path
func (h *UploadHandler) saveFile(src multipart.File, dst string) error {
	// Create destination file
	dstFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dstFile.Close()

	// Copy file content
	_, err = io.Copy(dstFile, src)
	if err != nil {
		return fmt.Errorf("failed to copy file content: %w", err)
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
