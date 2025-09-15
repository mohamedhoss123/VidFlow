package models

import "time"

// UploadRequest represents the video upload request
type UploadRequest struct {
	UserID      string `json:"user_id" binding:"required" example:"user123"`
	Description string `json:"description" example:"A sample video upload"`
	Name        string `json:"name" example:"My Video"`
}

// UploadResponse represents the response after successful upload
type UploadResponse struct {
	VideoID   string    `json:"video_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	ObjectID  string    `json:"object_id" example:"videos/123e4567-e89b-12d3-a456-426614174000.mp4"`
	Message   string    `json:"message" example:"Video uploaded successfully and processing started"`
	Status    string    `json:"status" example:"processing"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T12:00:00Z"`
}

// ThumbnailUploadResponse represents the response after successful thumbnail upload
type ThumbnailUploadResponse struct {
	VideoID   string    `json:"video_id" example:"123e4567-e89b-12d3-a456-426614174000"`
	ObjectID  string    `json:"object_id" example:"thumbnails/123e4567-e89b-12d3-a456-426614174000.jpg"`
	Message   string    `json:"message" example:"Thumbnail uploaded successfully"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T12:00:00Z"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error" example:"Invalid file"`
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"File validation failed"`
}

// CreateVideoPaylodRabbitmq represents the message sent to RabbitMQ for video processing
type CreateVideoPaylodRabbitmq struct {
	VideoID  string `json:"videoId"`
	ObjectId string `json:"objectId"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status" example:"healthy"`
	Timestamp time.Time         `json:"timestamp" example:"2024-01-01T12:00:00Z"`
	Services  map[string]string `json:"services"`
}

// FileInfo represents uploaded file information
type FileInfo struct {
	OriginalName string `json:"original_name" example:"video.mp4"`
	Size         int64  `json:"size" example:"1048576"`
	ContentType  string `json:"content_type" example:"video/mp4"`
	Extension    string `json:"extension" example:".mp4"`
}

// VideoMetadata represents video metadata
type VideoMetadata struct {
	Duration  int64  `json:"duration,omitempty" example:"120"`
	Width     int    `json:"width,omitempty" example:"1920"`
	Height    int    `json:"height,omitempty" example:"1080"`
	Bitrate   int64  `json:"bitrate,omitempty" example:"5000000"`
	FrameRate string `json:"frame_rate,omitempty" example:"30.0"`
	Codec     string `json:"codec,omitempty" example:"h264"`
	Format    string `json:"format,omitempty" example:"mp4"`
}
