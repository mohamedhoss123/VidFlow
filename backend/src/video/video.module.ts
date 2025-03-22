import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from './services/file-upload.service';
import { VideoController } from './video.controller';
import { VideoService } from './services/video.service';
import { BullModule } from '@nestjs/bullmq';
import { VideoProcessorService } from './services/video-processor.service';

@Module({
  imports: [BullModule.registerQueue({
    name: 'video-queue',
  }),],
  controllers: [VideoController,],
  providers: [FileUploadService, VideoService, PrismaService,VideoProcessorService],
  exports: []
})
export class VideoModule { }
