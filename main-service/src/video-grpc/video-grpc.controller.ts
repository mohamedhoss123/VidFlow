import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type { VideoService } from 'src/video/video.service';

@Controller()
export class VideoGrpcController {
  constructor(private videoService: VideoService) {}

  @GrpcMethod('VideoService', 'CreateVideo')
  createVideo(data: { title: string; url: string }) {
    return this.videoService.createVideo(data);
  }
}
