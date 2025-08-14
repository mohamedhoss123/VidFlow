package models

import "time"

// VideoProcessingMessage represents the message sent to RabbitMQ for video processing
type VideoProcessingMessage struct {
	VideoID    string `json:"video_id"`
	SignedURL  string `json:"signed_url"`
	ObjectName string `json:"object_name"`
}

// ProcessedVideoResult represents the result of video processing
type ProcessedVideoResult struct {
	VideoID     string                  `json:"video_id"`
	Status      string                  `json:"status"` // "success", "failed", "processing"
	Error       string                  `json:"error,omitempty"`
	ProcessedAt time.Time               `json:"processed_at"`
	Qualities   []ProcessedVideoQuality `json:"qualities,omitempty"`
}

// ProcessedVideoQuality represents a processed video quality variant
type ProcessedVideoQuality struct {
	Quality     string    `json:"quality"`                // e.g., "720p"
	ObjectName  string    `json:"object_name"`            // MinIO object name
	SignedURL   string    `json:"signed_url"`             // Signed URL for access
	ExpiresAt   time.Time `json:"expires_at"`             // URL expiration
	FileSize    int64     `json:"file_size"`              // File size in bytes
	Duration    float64   `json:"duration"`               // Video duration in seconds
	Format      string    `json:"format"`                 // e.g., "hls", "mp4"
	ManifestURL string    `json:"manifest_url,omitempty"` // For HLS playlists
}
