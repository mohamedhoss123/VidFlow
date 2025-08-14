package models

import "time"

// VideoProcessingMessage represents the message sent to RabbitMQ for video processing
type VideoProcessingMessage struct {
	VideoID           string    `json:"video_id"`
	SignedURL         string    `json:"signed_url"`
	ExpiresAt         time.Time `json:"expires_at"`
	ObjectName        string    `json:"object_name"`
	UserID            string    `json:"user_id,omitempty"`
	Description       string    `json:"description,omitempty"`
	OriginalFilename  string    `json:"original_filename,omitempty"`
	ProcessingOptions ProcessingOptions `json:"processing_options,omitempty"`
}

// ProcessingOptions defines video processing parameters
type ProcessingOptions struct {
	Qualities       []string `json:"qualities,omitempty"`        // e.g., ["144p", "360p", "720p"]
	OutputFormat    string   `json:"output_format,omitempty"`    // e.g., "hls", "mp4"
	SegmentDuration int      `json:"segment_duration,omitempty"` // for HLS segments in seconds
}
