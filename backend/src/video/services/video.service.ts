import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BucketService } from "./bucket.service";

@Injectable()
export class VideoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bucketService: BucketService,
  ) {}
  create(name: string, url: string, size: number) {
    return this.prismaService.video.create({
      data: {
        name: name,
        size: size,
        userId: 1,
      },
    });
  }

  async getVideoStream(videoId: string) {
    const data = await this.bucketService.getVideo(videoId);
    await this.prismaService.userBandwidthSummary.create({
      data: {
        total: (data.ContentLength as number) / 1024,
        userId: 1,
      },
    });
    if (data.Body) return data.Body;
    else throw new BadRequestException();
  }

  async getVideoInfo(videoId: number) {
    const data = await this.prismaService.video.findUnique({
      where: {
        id: Number(videoId),
      },
      include: {
        quality: true,
      },
    });
    return data;
  }

  cursorPagination(cursor?: number) {
    return this.prismaService.video.findMany({
      take: 10,
      skip: cursor ? 1 : 0, // Skip cursor if provided
      cursor: cursor ? { id: Number(cursor) } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }
}
