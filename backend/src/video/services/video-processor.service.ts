
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { VideoService } from './video.service';


@Processor("video-queue")
export class VideoProcessorService  extends WorkerHost{
  constructor(private readonly videoService: VideoService, private readonly fileUploadService: FileUploadService) {
    super()
  }
  private readonly logger = new Logger(VideoProcessorService.name);
  async process(job: Job<{videoId:string}>, token?: string): Promise<any> {
    const videoId = job.data.videoId;
    this.logger.log(`Processing video with ID: ${videoId}`);
    await this.videoService.optomizeFile(videoId);
    this.logger.log(`Optimized video with ID: ${videoId}`);
    await job.updateProgress(100)
    return{}
  }
}
