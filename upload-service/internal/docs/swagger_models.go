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
	Ready     bool              `json:"ready" example:"true"`
	Timestamp time.Time         `json:"timestamp"`
	Services  map[string]bool   `json:"services"`
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
