import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoService } from './video/video.service';
import { VideoGrpcService } from './video-grpc/video-grpc.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, VideoService, VideoGrpcService],
})
export class AppModule {}
