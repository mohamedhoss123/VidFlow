import { Module } from "@nestjs/common";
import { BucketService } from "./services/bucket.service";
import { VideoController } from "./video.controller";
import { VideoService } from "./services/video.service";
import { BullModule } from "@nestjs/bullmq";
import { VideoProcessorService } from "./processors/video-processor";
import { AuthModule } from "src/auth/auth.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { OptimizeService } from "./services/optimize.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "video-queue",
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [VideoController],
  providers: [
    BucketService,
    VideoService,
    VideoProcessorService,
    OptimizeService,
  ],
  exports: [],
})
export class VideoModule {}
