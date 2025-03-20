import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [],
  controllers: [VideoController,],
  providers: [VideoService,],
  exports: []
})
export class VideoModule { }
