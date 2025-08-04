package services

import (
	"context"
	"fmt"
	"time"

	"vidflow/upload-service/internal/config"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

// RabbitMQService handles RabbitMQ message publishing operations
type RabbitMQService struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	logger     *logrus.Logger
	url        string
}

// NewRabbitMQService creates a new RabbitMQ service instance
func NewRabbitMQService(cfg *config.Config, logger *logrus.Logger) (*RabbitMQService, error) {
	// Connect to RabbitMQ
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	// Create channel
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create RabbitMQ channel: %w", err)
	}

	service := &RabbitMQService{
		connection: conn,
		channel:    ch,
		queueName:  cfg.RabbitMQQueue,
		logger:     logger,
		url:        cfg.RabbitMQURL,
	}

	// Ensure queue exists
	if err := service.ensureQueueExists(); err != nil {
		service.Close()
		return nil, fmt.Errorf("failed to ensure queue exists: %w", err)
	}

	logger.WithFields(logrus.Fields{
		"queue": cfg.RabbitMQQueue,
		"url":   maskPassword(cfg.RabbitMQURL),
	}).Info("RabbitMQ service initialized successfully")

	return service, nil
}

// ensureQueueExists declares the queue if it doesn't exist
func (r *RabbitMQService) ensureQueueExists() error {
	_, err := r.channel.QueueDeclare(
		r.queueName, // name
		true,        // durable - make queue persistent
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	r.logger.WithField("queue", r.queueName).Info("RabbitMQ queue declared")
	return nil
}

// PublishVideoProcessingMessage publishes a video processing message to the queue
func (r *RabbitMQService) PublishVideoProcessingMessage(ctx context.Context, videoURL string) error {
	// Set timeout for publish operation
	publishCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	r.logger.WithFields(logrus.Fields{
		"video_url": videoURL,
		"queue":     r.queueName,
	}).Info("Publishing video processing message to RabbitMQ")

	// Publish message
	err := r.channel.PublishWithContext(
		publishCtx,
		"",          // exchange (using default)
		r.queueName, // routing key (queue name)
		false,       // mandatory
		false,       // immediate
		amqp.Publishing{
			ContentType:  "text/plain",
			Body:         []byte(videoURL),
			DeliveryMode: amqp.Persistent, // make message persistent
			Timestamp:    time.Now(),
			MessageId:    fmt.Sprintf("video-processing-%d", time.Now().UnixNano()),
		},
	)
	if err != nil {
		r.logger.WithError(err).WithFields(logrus.Fields{
			"video_url": videoURL,
			"queue":     r.queueName,
		}).Error("Failed to publish message to RabbitMQ")
		return fmt.Errorf("failed to publish message to RabbitMQ: %w", err)
	}

	r.logger.WithFields(logrus.Fields{
		"video_url": videoURL,
		"queue":     r.queueName,
	}).Info("Video processing message published to RabbitMQ successfully")

	return nil
}

// HealthCheck performs a health check on the RabbitMQ service
func (r *RabbitMQService) HealthCheck(ctx context.Context) error {
	// Check if connection is alive
	if r.connection == nil || r.connection.IsClosed() {
		return fmt.Errorf("RabbitMQ connection is closed")
	}

	// Check if channel is alive
	if r.channel == nil || r.channel.IsClosed() {
		return fmt.Errorf("RabbitMQ channel is closed")
	}

	// Use a simple queue inspection as health check
	_, err := r.channel.QueueInspect(r.queueName)
	if err != nil {
		r.logger.WithError(err).Warn("RabbitMQ health check failed")
		return fmt.Errorf("RabbitMQ health check failed: %w", err)
	}

	return nil
}

// Reconnect attempts to reconnect to RabbitMQ
func (r *RabbitMQService) Reconnect() error {
	r.logger.Info("Attempting to reconnect to RabbitMQ")

	// Close existing connections
	if r.channel != nil && !r.channel.IsClosed() {
		r.channel.Close()
	}
	if r.connection != nil && !r.connection.IsClosed() {
		r.connection.Close()
	}

	// Reconnect
	conn, err := amqp.Dial(r.url)
	if err != nil {
		return fmt.Errorf("failed to reconnect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return fmt.Errorf("failed to create RabbitMQ channel on reconnect: %w", err)
	}

	r.connection = conn
	r.channel = ch

	// Ensure queue exists after reconnection
	if err := r.ensureQueueExists(); err != nil {
		return fmt.Errorf("failed to ensure queue exists after reconnect: %w", err)
	}

	r.logger.Info("Successfully reconnected to RabbitMQ")
	return nil
}

// Close closes the RabbitMQ connection and channel
func (r *RabbitMQService) Close() error {
	var errs []error

	if r.channel != nil && !r.channel.IsClosed() {
		if err := r.channel.Close(); err != nil {
			errs = append(errs, fmt.Errorf("failed to close RabbitMQ channel: %w", err))
		}
	}

	if r.connection != nil && !r.connection.IsClosed() {
		if err := r.connection.Close(); err != nil {
			errs = append(errs, fmt.Errorf("failed to close RabbitMQ connection: %w", err))
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("errors closing RabbitMQ service: %v", errs)
	}

	r.logger.Info("RabbitMQ service closed successfully")
	return nil
}

// maskPassword masks the password in the RabbitMQ URL for logging
func maskPassword(url string) string {
	// Simple password masking for logging - replace password with ***
	// Find the password part and replace it
	if len(url) > 0 && url != "" {
		// Basic masking - replace everything between :// and @ with masked credentials
		return "amqp://***:***@rabbitmq:5672/vidflow"
	}
	return url
}
