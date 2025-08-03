import { Injectable } from '@nestjs/common';
import type { VideoService } from 'src/video/video.service';

@Injectable()
export class VideoGrpcService {
  constructor(private videoService: VideoService) {}

  async createVideo(data: { title: string; url: string }) {
    return this.videoService.createVideo(data);
  }
}
