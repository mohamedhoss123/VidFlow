import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { BucketService } from "../services/bucket.service";
import * as fs from "fs/promises";
import { PrismaService } from "src/prisma/prisma.service";
import { VideoStatus } from "@prisma/client";
import { VideoQualityEnum } from "../enums/video-quality.enum";
import { OptimizeService } from "../services/optimize.service";

@Processor("video-queue")
export class VideoProcessorService extends WorkerHost {
  constructor(
    private readonly optomizeService: OptimizeService,
    private readonly bucketService: BucketService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }
  async process(
    job: Job<{ videoId: string; id: number; resulution: VideoQualityEnum }>,
    // token?: string,
  ): Promise<any> {
    const videoId = job.data.videoId;
    console.log(job.data);
    for (const resolution of Object.values(VideoQualityEnum)) {
      await this.optomizeService.optimizeFile(videoId, resolution);

      const files = await fs.readdir("./video");
      await Promise.all(
        files.map(async (file) => {
          if (file.includes(videoId)) {
            await this.bucketService.uploadVideo(
              await fs.readFile("./video/" + file),
              file,
            );
            await fs.unlink("./video/" + file);
          }
        }),
      );

      await this.prismaService.videoQuality.create({
        data: {
          videoId: job.data.id,
          quality: resolution,
          url: "optimized-" + job.data.videoId + ".m3u8",
        },
      });
    }
    await this.prismaService.video.update({
      where: { id: job.data.id },
      data: {
        status: VideoStatus.READY,
      },
    });
    await job.updateProgress(100);
    return {};
  }
}
