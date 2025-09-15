package main

import (
	"encoding/json"
	"log"
	"optimize-service/internal/config"
	"optimize-service/internal/models"
	"optimize-service/internal/util"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	cfg := config.Load()

	log.Println("Starting optimize service...")
	log.Printf("Connecting to RabbitMQ at: %s", maskPassword(cfg.RabbitMQURL))

	// Retry connection with exponential backoff
	var conn *amqp.Connection
	var err error
	maxRetries := 10
	baseDelay := time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		conn, err = amqp.Dial(cfg.RabbitMQURL)
		if err == nil {
			log.Println("Successfully connected to RabbitMQ")
			break
		}

		if attempt == maxRetries {
			log.Fatalf("Failed to connect to RabbitMQ after %d attempts: %v", maxRetries, err)
		}

		delay := time.Duration(attempt) * baseDelay
		log.Printf("Failed to connect to RabbitMQ (attempt %d/%d): %v. Retrying in %v...",
			attempt, maxRetries, err, delay)
		time.Sleep(delay)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to create RabbitMQ channel: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		cfg.RabbitMQQueue, // name
		true,              // durable
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare queue: %v", err)
	}

	log.Printf("Queue '%s' declared successfully", cfg.RabbitMQQueue)

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Failed to start consuming messages: %v", err)
	}

	log.Println("Optimize service is ready to process messages")

	forever := make(chan bool)
	go func() {
		for d := range msgs {
			var payload models.CreateVideoPaylodRabbitmq
			if err := json.Unmarshal(d.Body, &payload); err != nil {
				log.Printf("Error decoding JSON: %v", err)
				continue
			}

			log.Printf("Processing video optimization for VideoID: %s, ObjectID: %s",
				payload.VideoID, payload.ObjectId)

			util.ClearVideoDir()
			util.Optomize(payload)

			log.Printf("Completed video optimization for VideoID: %s", payload.VideoID)
		}
	}()
	<-forever
}

// maskPassword masks the password in the RabbitMQ URL for logging
func maskPassword(url string) string {
	if len(url) > 0 && url != "" {
		return "amqp://***:***@rabbitmq:5672/vidflow"
	}
	return url
}
