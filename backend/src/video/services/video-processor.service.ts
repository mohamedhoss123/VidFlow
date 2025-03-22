
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';


@Processor("video-queue")
export class VideoProcessorService  extends WorkerHost{
  private readonly logger = new Logger(VideoProcessorService.name);
  async process(job: Job, token?: string): Promise<any> {
    const videoId = job.data.videoId;
    this.logger.log("hello from job",videoId)
    // return this.fileUploadService.optomizeFile(videoId);
  await job.updateProgress(100)
    return{}
  }
}
