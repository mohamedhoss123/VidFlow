package docs

import "time"

// ServiceInfoResponse represents the service information response
type ServiceInfoResponse struct {
	Service   string            `json:"service" example:"VidFlow Upload Service"`
	Version   string            `json:"version" example:"1.0.0"`
	Status    string            `json:"status" example:"running"`
	Timestamp time.Time         `json:"timestamp"`
	Endpoints map[string]string `json:"endpoints"`
}

// LivenessResponse represents the liveness probe response
type LivenessResponse struct {
	Status    string    `json:"status" example:"alive"`
	Timestamp time.Time `json:"timestamp"`
}

// ReadinessResponse represents the readiness probe response
type ReadinessResponse struct {
	Ready     bool            `json:"ready" example:"true"`
	Timestamp time.Time       `json:"timestamp"`
	Services  map[string]bool `json:"services"`
}

// UploadStatusResponse represents the upload status response
type UploadStatusResponse struct {
	VideoID string `json:"video_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Status  string `json:"status" example:"processing"`
	Message string `json:"message" example:"Video is being processed"`
}

// UploadLimitsResponse represents the upload limits response
type UploadLimitsResponse struct {
	MaxFileSize   int64    `json:"max_file_size" example:"1073741824"`
	MaxFileSizeMB int64    `json:"max_file_size_mb" example:"1024"`
	AllowedTypes  []string `json:"allowed_types"`
}

// ThumbnailStatusResponse represents the thumbnail status response
type ThumbnailStatusResponse struct {
	VideoID     string    `json:"video_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	ThumbnailID string    `json:"thumbnail_id,omitempty" example:"thumb_123e4567-e89b-12d3-a456-426614174000"`
	Status      string    `json:"status" example:"uploaded"`
	Message     string    `json:"message" example:"Thumbnail uploaded successfully"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
}

// FileUploadRequest represents the file upload request parameters
type FileUploadRequest struct {
	File        string `json:"file" swaggertype:"string" format:"binary" example:"video.mp4"`
	Name        string `json:"name,omitempty" example:"My Video"`
	Description string `json:"description,omitempty" example:"A sample video upload"`
}

// ThumbnailUploadRequest represents the thumbnail upload request parameters
type ThumbnailUploadRequest struct {
	Thumbnail string `json:"thumbnail" swaggertype:"string" format:"binary" example:"thumbnail.jpg"`
	VideoID   string `json:"video_id" example:"123e4567-e89b-12d3-a456-426614174000"`
}

// Specific Error Response Models for different HTTP status codes

// BadRequestError represents a 400 Bad Request error
type BadRequestError struct {
	Error   string `json:"error" example:"Bad Request"`
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"Invalid request parameters or missing required fields"`
}

// UnauthorizedError represents a 401 Unauthorized error
type UnauthorizedError struct {
	Error   string `json:"error" example:"Unauthorized"`
	Code    int    `json:"code" example:"401"`
	Message string `json:"message" example:"Missing or invalid x-user-id header"`
}

// ForbiddenError represents a 403 Forbidden error
type ForbiddenError struct {
	Error   string `json:"error" example:"Forbidden"`
	Code    int    `json:"code" example:"403"`
	Message string `json:"message" example:"Access denied for this resource"`
}

// NotFoundError represents a 404 Not Found error
type NotFoundError struct {
	Error   string `json:"error" example:"Not Found"`
	Code    int    `json:"code" example:"404"`
	Message string `json:"message" example:"Video not found or does not exist"`
}

// RequestEntityTooLargeError represents a 413 Request Entity Too Large error
type RequestEntityTooLargeError struct {
	Error   string `json:"error" example:"Request Entity Too Large"`
	Code    int    `json:"code" example:"413"`
	Message string `json:"message" example:"File size exceeds maximum allowed limit of 500MB"`
}

// TooManyRequestsError represents a 429 Too Many Requests error
type TooManyRequestsError struct {
	Error   string `json:"error" example:"Too Many Requests"`
	Code    int    `json:"code" example:"429"`
	Message string `json:"message" example:"Rate limit exceeded. Please try again later"`
}

// InternalServerError represents a 500 Internal Server Error
type InternalServerError struct {
	Error   string `json:"error" example:"Internal Server Error"`
	Code    int    `json:"code" example:"500"`
	Message string `json:"message" example:"An unexpected error occurred while processing your request"`
}

// ServiceUnavailableError represents a 503 Service Unavailable error
type ServiceUnavailableError struct {
	Error   string `json:"error" example:"Service Unavailable"`
	Code    int    `json:"code" example:"503"`
	Message string `json:"message" example:"Service is temporarily unavailable. Please try again later"`
}
