package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
	"upload-service/internal/config"
	"upload-service/internal/models"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

// RabbitMQService handles RabbitMQ operations
type RabbitMQService struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	logger     *logrus.Logger
}

// NewRabbitMQService creates a new RabbitMQ service instance
func NewRabbitMQService(cfg *config.Config, logger *logrus.Logger) (*RabbitMQService, error) {
	// Connect to RabbitMQ with retry logic
	conn, err := connectWithRetry(cfg.RabbitMQ.URL, logger)
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
		queueName:  cfg.RabbitMQ.Queue,
		logger:     logger,
	}

	// Declare queue
	if err := service.declareQueue(); err != nil {
		service.Close()
		return nil, fmt.Errorf("failed to declare queue: %w", err)
	}

	logger.WithFields(logrus.Fields{
		"queue": cfg.RabbitMQ.Queue,
		"url":   maskPassword(cfg.RabbitMQ.URL),
	}).Info("RabbitMQ service initialized successfully")

	return service, nil
}

// connectWithRetry attempts to connect to RabbitMQ with exponential backoff
func connectWithRetry(url string, logger *logrus.Logger) (*amqp.Connection, error) {
	maxRetries := 10
	baseDelay := time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		conn, err := amqp.Dial(url)
		if err == nil {
			logger.Info("Successfully connected to RabbitMQ")
			return conn, nil
		}

		if attempt == maxRetries {
			return nil, fmt.Errorf("failed to connect after %d attempts: %w", maxRetries, err)
		}

		delay := time.Duration(attempt) * baseDelay
		logger.WithFields(logrus.Fields{
			"attempt": attempt,
			"max":     maxRetries,
			"delay":   delay,
			"error":   err.Error(),
		}).Warn("Failed to connect to RabbitMQ, retrying...")
		
		time.Sleep(delay)
	}

	return nil, fmt.Errorf("unreachable code")
}

// declareQueue declares the queue for video processing
func (s *RabbitMQService) declareQueue() error {
	_, err := s.channel.QueueDeclare(
		s.queueName, // name
		true,        // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue %s: %w", s.queueName, err)
	}

	s.logger.WithField("queue", s.queueName).Info("Queue declared successfully")
	return nil
}

// PublishVideoProcessingMessage publishes a message to trigger video processing
func (s *RabbitMQService) PublishVideoProcessingMessage(ctx context.Context, videoID, objectID string) error {
	// Create the message payload
	payload := models.CreateVideoPaylodRabbitmq{
		VideoID:  videoID,
		ObjectId: objectID,
	}

	// Marshal to JSON
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	// Publish the message
	err = s.channel.PublishWithContext(
		ctx,
		"",           // exchange
		s.queueName,  // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent, // Make message persistent
			Timestamp:    time.Now(),
			MessageId:    fmt.Sprintf("%s-%d", videoID, time.Now().UnixNano()),
		},
	)
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"video_id":  videoID,
			"object_id": objectID,
			"queue":     s.queueName,
			"error":     err.Error(),
		}).Error("Failed to publish video processing message")
		return fmt.Errorf("failed to publish message: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"video_id":  videoID,
		"object_id": objectID,
		"queue":     s.queueName,
	}).Info("Successfully published video processing message")

	return nil
}

// HealthCheck checks RabbitMQ connectivity
func (s *RabbitMQService) HealthCheck(ctx context.Context) error {
	if s.connection == nil || s.connection.IsClosed() {
		return fmt.Errorf("RabbitMQ connection is closed")
	}

	if s.channel == nil || s.channel.IsClosed() {
		return fmt.Errorf("RabbitMQ channel is closed")
	}

	// Try to declare a temporary queue to test connectivity
	tempQueueName := fmt.Sprintf("health-check-%d", time.Now().UnixNano())
	_, err := s.channel.QueueDeclare(
		tempQueueName,
		false, // not durable
		true,  // delete when unused
		true,  // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return fmt.Errorf("RabbitMQ health check failed: %w", err)
	}

	// Clean up the temporary queue
	_, err = s.channel.QueueDelete(tempQueueName, false, false, false)
	if err != nil {
		s.logger.WithField("queue", tempQueueName).Warn("Failed to delete temporary health check queue")
	}

	return nil
}

// Close closes the RabbitMQ connection and channel
func (s *RabbitMQService) Close() error {
	var errs []error

	if s.channel != nil && !s.channel.IsClosed() {
		if err := s.channel.Close(); err != nil {
			errs = append(errs, fmt.Errorf("failed to close channel: %w", err))
		}
	}

	if s.connection != nil && !s.connection.IsClosed() {
		if err := s.connection.Close(); err != nil {
			errs = append(errs, fmt.Errorf("failed to close connection: %w", err))
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("errors closing RabbitMQ: %v", errs)
	}

	s.logger.Info("RabbitMQ service closed successfully")
	return nil
}

// Reconnect attempts to reconnect to RabbitMQ
func (s *RabbitMQService) Reconnect(cfg *config.Config) error {
	s.logger.Info("Attempting to reconnect to RabbitMQ...")

	// Close existing connections
	s.Close()

	// Reconnect
	conn, err := connectWithRetry(cfg.RabbitMQ.URL, s.logger)
	if err != nil {
		return fmt.Errorf("failed to reconnect to RabbitMQ: %w", err)
	}

	// Create new channel
	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return fmt.Errorf("failed to create new channel: %w", err)
	}

	// Update service
	s.connection = conn
	s.channel = ch

	// Redeclare queue
	if err := s.declareQueue(); err != nil {
		return fmt.Errorf("failed to redeclare queue: %w", err)
	}

	s.logger.Info("Successfully reconnected to RabbitMQ")
	return nil
}

// maskPassword masks the password in the RabbitMQ URL for logging
func maskPassword(url string) string {
	if len(url) > 0 && url != "" {
		return "amqp://***:***@rabbitmq:5672/vidflow"
	}
	return url
}
