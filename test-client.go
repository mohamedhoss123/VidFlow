package main

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func main() {
	// Create a buffer to store the multipart form data
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	// Add the video file
	file, err := os.Open("video.mp4") // replace it to your own video
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		return
	}
	defer file.Close()

	part, err := writer.CreateFormFile("video", "video.mp4") // replace it to your own video name
	if err != nil {
		fmt.Printf("Error creating form file: %v\n", err)
		return
	}

	_, err = io.Copy(part, file)
	if err != nil {
		fmt.Printf("Error copying file: %v\n", err)
		return
	}

	// Add other form fields
	writer.WriteField("user_id", "test-user-123")
	writer.WriteField("description", "Real video upload test - MinIO and RabbitMQ integration")

	// Close the writer
	writer.Close()

	// Create the HTTP request
	req, err := http.NewRequest("POST", "http://localhost:8081/upload", &buf)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		return
	}
	defer resp.Body.Close()

	// Read the response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return
	}

	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Response: %s\n", string(body))
}
