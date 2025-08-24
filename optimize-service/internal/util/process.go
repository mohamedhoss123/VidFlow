package util

import (
	"context"
	"fmt"
	"log"
	"optimize-service/internal/config"
	"optimize-service/internal/models"
	"optimize-service/internal/services"
	"os"

	"os/exec"

	"github.com/sirupsen/logrus"
)

func Optomize(payload models.CreateVideoPaylodRabbitmq) {
	for key, resolution := range config.Resolutions {
		clearDir()
		id, err := NewUUIDv7()
		if err != nil {
			log.Fatal("error generating uuid")
		}
		minioService, err := services.NewMinIOService(config.Load(), logrus.New())
		if err != nil {
			log.Fatal("error creating minio service")
		}
		url, err := minioService.GenerateSignedURLForProcessedVideo(context.Background(), payload.ObjectId)
		if err != nil {
			log.Fatal("error generating signed url")
		}
		toQuality(id, url.String(), resolution)
		uploadToBucket(key)
	}

}

func toQuality(id string, url string, resultion config.Resolution) {

	segmentFilename := fmt.Sprintf("./video/%s-%%03d.tss", id)
	outputM3U8 := fmt.Sprintf("./video/optimized-%s.m3u8", id)

	cmd := exec.Command(
		"ffmpeg",
		"-i", url,
		"-c:v", "h264",
		"-preset", "fast",
		"-b:v", resultion.VideoBitrate,
		"-vf", fmt.Sprintf("scale=%d:%d", resultion.Width, resultion.Height),
		"-hls_list_size", "0",
		"-hls_segment_filename",
		segmentFilename,
		outputM3U8,
	)

	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	if err := cmd.Run(); err != nil {
		log.Println("Error running ffmpeg:", err)
	}

}

func clearDir() {
	cmd := exec.Command("rm", "-r", "video")
	if err := cmd.Run(); err != nil {
		log.Println("Error command faild", err)
	}
	cmd = exec.Command("mkdir", "video")
	if err := cmd.Run(); err != nil {
		log.Println("Error command faild", err)
	}
}

func uploadToBucket(quality string) {
	fmt.Println(quality)
}
