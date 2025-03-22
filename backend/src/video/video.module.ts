import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from './services/file-upload.service';
import { VideoController } from './video.controller';
import { VideoService } from './services/video.service';

@Module({
  imports: [],
  controllers: [VideoController,],
  providers: [FileUploadService, VideoService, PrismaService],
  exports: []
})
export class VideoModule { }
