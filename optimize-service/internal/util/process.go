package util

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"optimize-service/internal/config"
	"optimize-service/internal/models"
	"optimize-service/internal/services"
	"optimize-service/proto/video"
	"os"
	"strconv"

	"os/exec"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

type FFProbeFormat struct {
	Duration string `json:"duration"`
}

type FFProbeOutput struct {
	Format FFProbeFormat `json:"format"`
}

func Optomize(payload models.CreateVideoPaylodRabbitmq) {
	minioService, err := services.GetMinIOService(config.Load(), logrus.New())
	if err != nil {
		log.Fatal(err)
	}
	minioService.DownloadVideo(payload.ObjectId)
	videoResponse := video.VideoReadyRequest{
		VideoId: payload.VideoID,
		Quality: []*video.VideoQuality{},
	}
	for key, resolution := range config.Resolutions {
		clearQalityDir()
		id, err := NewUUIDv7()
		if err != nil {
			log.Fatal("error generating uuid")
		}

		toQuality(id, "./video/"+payload.ObjectId, resolution)
		uploadToBucket()
		videoResponse.Quality = append(videoResponse.Quality, &video.VideoQuality{
			Id:       id,
			Quality:  key,
			VideoId:  payload.VideoID,
			ObjectId: payload.ObjectId,
		})

	}

	videoResponse.Length = getVideoLength("./video/" + payload.ObjectId)
	makeVideoRead(videoResponse)

}

func getVideoLength(url string) int32 {
	cmd := exec.Command("ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", url)
	out, err := cmd.Output()
	if err != nil {
		log.Fatalf("failed to run ffprobe: %v", err)
	}

	var result FFProbeOutput
	if err := json.Unmarshal(out, &result); err != nil {
		log.Fatalf("failed to unmarshal ffprobe output: %v", err)
	}
	seconds, err := strconv.ParseFloat(result.Format.Duration, 64)
	if err != nil {
		panic("video lengnth is not valid")
	}
	return int32(seconds)
}
func toQuality(id string, url string, resultion config.Resolution) {

	segmentFilename := fmt.Sprintf("./video/quality/%s-%%03d.tss", id)
	outputM3U8 := fmt.Sprintf("./video/quality/optimized-%s.m3u8", id)

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

func clearQalityDir() {
	cmd := exec.Command("rm", "-r", "video/quality")
	if err := cmd.Run(); err != nil {
		log.Println("Error command faild", err)
	}
	cmd = exec.Command("mkdir", "video/quality")
	if err := cmd.Run(); err != nil {
		log.Println("Error command faild", err)
	}
}

func ClearVideoDir() {
	cmd := exec.Command("rm", "-r", "video")
	if err := cmd.Run(); err != nil {
		log.Println("Error command faild", err)
	}
	cmd = exec.Command("mkdir", "video")
	if err := cmd.Run(); err != nil {
		log.Println("Error command faild", err)
	}
}

func uploadToBucket() {
	minioService, err := services.GetMinIOService(config.Load(), logrus.New())
	if err != nil {
		log.Fatal(err)
	}
	files, err := os.ReadDir("./video/quality")
	if err != nil {
		panic(err)
	}

	for _, f := range files {

		minioService.UploadVideo(f.Name())
	}
}

func makeVideoRead(videoResponse video.VideoReadyRequest) {
	conn, err := grpc.NewClient("main-service:50051", grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()
	client := video.NewVideoServiceClient(conn)
	_, err = client.MakeVideoReady(context.Background(), &videoResponse)
	if err != nil {
		log.Fatalf("could not make video ready: %v", err)
	}
}
