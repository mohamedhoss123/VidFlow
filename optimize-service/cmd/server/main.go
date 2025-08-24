package main

import (
	"encoding/json"
	"log"
	"optimize-service/internal/models"
	"optimize-service/internal/util"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {

	conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"video.quality.processing", // name
		true,                       // durable
		false,                      // delete when unused
		false,                      // exclusive
		false,                      // no-wait
		nil,                        // arguments
	)
	if err != nil {
		log.Fatal(err)
	}

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
		log.Fatal(err)
	}

	forever := make(chan bool)
	go func() {
		for d := range msgs {
			var payload models.CreateVideoPaylodRabbitmq
			if err := json.Unmarshal(d.Body, &payload); err != nil {
				log.Printf("Error decoding JSON: %v", err)
				continue
			}
			util.ClearVideoDir()
			
			util.Optomize(payload)
		}
	}()
	<-forever
}
