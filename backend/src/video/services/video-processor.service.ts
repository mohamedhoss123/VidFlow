import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { FileUploadService } from "./file-upload.service";
import { VideoService } from "./video.service";
import * as fs from "fs";
import { PrismaService } from "src/prisma/prisma.service";
import { VideoStatus } from "@prisma/client";

@Processor("video-queue")
export class VideoProcessorService extends WorkerHost {
  constructor(
    private readonly videoService: VideoService,
    private readonly fileUploadService: FileUploadService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }
  private readonly logger = new Logger(VideoProcessorService.name);
  async process(
    job: Job<{ videoId: string; id: number }>,
    token?: string,
  ): Promise<any> {
    const videoId = job.data.videoId;
    this.logger.log(`Processing video with ID: ${videoId}`);
    await this.videoService.optomizeFile(videoId);
    fs.readdirSync("./video").forEach(async (file) => {
      if (file.includes(videoId)) {
        await this.fileUploadService.uploadFile(
          fs.readFileSync("./video/" + file),
          file,
        );

        fs.unlinkSync("./video/" + file);
      }
    });
    await this.prismaService.video.update({
      where: { id: job.data.id },
      data: {
        url: "optimized-" + job.data.videoId + ".m3u8",
        status: VideoStatus.READY,
      },
    });
    this.logger.log(`Optimized video with ID: ${videoId}`);
    await job.updateProgress(100);
    return {};
  }
}
