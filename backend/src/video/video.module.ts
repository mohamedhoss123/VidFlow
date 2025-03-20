import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from './file-upload.service';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [],
  controllers: [VideoController,],
  providers: [FileUploadService, VideoService, PrismaService],
  exports: []
})
export class VideoModule { }
