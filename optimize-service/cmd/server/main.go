package main

import (
	"context"
	"encoding/json"
	"optimize-service/internal/config"
	"optimize-service/internal/models"
	"optimize-service/internal/services"
	"optimize-service/internal/util"
	"os"
	"os/signal"
	"syscall"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Setup logger
	logger := logrus.New()
	level, err := logrus.ParseLevel(cfg.LogLevel)
	if err != nil {
		logger.Warn("Invalid log level, using info")
		level = logrus.InfoLevel
	}
	logger.SetLevel(level)
	logger.SetFormatter(&logrus.JSONFormatter{})

	logger.Info("Starting optimization service")

	// Initialize MinIO service
	minioService, err := services.NewMinIOService(cfg, logger)
	if err != nil {
		logger.WithError(err).Fatal("Failed to initialize MinIO service")
	}

	// Initialize video processor
	processor := util.NewVideoProcessor(cfg, minioService, logger)

	// Connect to RabbitMQ
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		logger.WithError(err).Fatal("Failed to connect to RabbitMQ")
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		logger.WithError(err).Fatal("Failed to create RabbitMQ channel")
	}
	defer ch.Close()

	// Declare queue
	q, err := ch.QueueDeclare(
		cfg.RabbitMQQueue, // name
		true,              // durable - make queue persistent
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		logger.WithError(err).Fatal("Failed to declare queue")
	}

	// Set QoS to limit concurrent processing
	err = ch.Qos(cfg.MaxConcurrency, 0, false)
	if err != nil {
		logger.WithError(err).Fatal("Failed to set QoS")
	}

	// Start consuming messages
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (disabled for manual ack)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		logger.WithError(err).Fatal("Failed to start consuming messages")
	}

	logger.WithFields(logrus.Fields{
		"queue":           cfg.RabbitMQQueue,
		"max_concurrency": cfg.MaxConcurrency,
	}).Info("Started consuming video processing messages")

	// Handle graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Process messages
	go func() {
		for d := range msgs {
			go func(delivery amqp.Delivery) {
				if err := processMessage(ctx, delivery, processor, logger); err != nil {
					logger.WithError(err).Error("Failed to process message")
					delivery.Nack(false, true) // Requeue on error
				} else {
					delivery.Ack(false) // Acknowledge successful processing
				}
			}(d)
		}
	}()

	// Wait for shutdown signal
	<-sigChan
	logger.Info("Shutting down optimization service...")
	cancel()
}

func processMessage(ctx context.Context, delivery amqp.Delivery, processor *util.VideoProcessor, logger *logrus.Logger) error {
	// Check message version from headers
	messageVersion := "v1" // default to v1 for backward compatibility
	if headers := delivery.Headers; headers != nil {
		if version, ok := headers["message_version"].(string); ok {
			messageVersion = version
		}
	}

	logger.WithFields(logrus.Fields{
		"message_id":      delivery.MessageId,
		"message_version": messageVersion,
	}).Info("Processing video message")

	switch messageVersion {
	case "v2":
		return processMessageV2(ctx, delivery, processor, logger)
	default:
		return processMessageV1(ctx, delivery, processor, logger)
	}
}

func processMessageV2(ctx context.Context, delivery amqp.Delivery, processor *util.VideoProcessor, logger *logrus.Logger) error {
	var message models.VideoProcessingMessage
	if err := json.Unmarshal(delivery.Body, &message); err != nil {
		logger.WithError(err).Error("Failed to unmarshal v2 message")
		return err
	}

	logger.WithFields(logrus.Fields{
		"video_id":    message.VideoID,
		"signed_url":  message.SignedURL,
		"object_name": message.ObjectName,
		"expires_at":  message.ExpiresAt,
	}).Info("Processing v2 video message")

	return processor.ProcessVideoFromSignedURL(ctx, &message)
}

func processMessageV1(ctx context.Context, delivery amqp.Delivery, processor *util.VideoProcessor, logger *logrus.Logger) error {
	videoURL := string(delivery.Body)

	logger.WithFields(logrus.Fields{
		"video_url": videoURL,
	}).Info("Processing v1 video message (legacy)")

	// For backward compatibility, create a basic message structure
	message := &models.VideoProcessingMessage{
		VideoID:   "legacy-" + delivery.MessageId,
		SignedURL: videoURL,
		ProcessingOptions: models.ProcessingOptions{
			Qualities:       []string{"144p", "360p", "720p"},
			OutputFormat:    "hls",
			SegmentDuration: 10,
		},
	}

	return processor.ProcessVideoFromSignedURL(ctx, message)
}
