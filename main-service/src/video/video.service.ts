import { Injectable } from '@nestjs/common';
import { PrismaService } from '_/genteted/prisma';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async createVideo(data: { title: string; url: string }) {
    return this.prisma.video.create({ data });
  }

  async markOptimized(videoId: string) {
    return this.prisma.video.update({
      where: { id: videoId },
      data: { optimized: true },
    });
  }
}
