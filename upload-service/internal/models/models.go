package models

import "time"

// UploadRequest represents the video upload request
type UploadRequest struct {
	UserID      string `json:"user_id" binding:"required"`
	Description string `json:"description"`
	Name        string `json:"name"`
}

// UploadResponse represents the response after successful upload
type UploadResponse struct {
	VideoID   string `json:"video_id"`
	ObjectID  string `json:"object_id"`
	Message   string `json:"message"`
	Status    string `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// CreateVideoPaylodRabbitmq represents the message sent to RabbitMQ for video processing
type CreateVideoPaylodRabbitmq struct {
	VideoID  string `json:"videoId"`
	ObjectId string `json:"objectId"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Services  map[string]string `json:"services"`
}

// FileInfo represents uploaded file information
type FileInfo struct {
	OriginalName string
	Size         int64
	ContentType  string
	Extension    string
}

// VideoMetadata represents video metadata
type VideoMetadata struct {
	Duration    int64  `json:"duration,omitempty"`
	Width       int    `json:"width,omitempty"`
	Height      int    `json:"height,omitempty"`
	Bitrate     int64  `json:"bitrate,omitempty"`
	FrameRate   string `json:"frame_rate,omitempty"`
	Codec       string `json:"codec,omitempty"`
	Format      string `json:"format,omitempty"`
}
