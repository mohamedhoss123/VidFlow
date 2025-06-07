import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BucketService } from "./bucket.service";
import { UpdateVideoDto } from "../dto/update-video.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class VideoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bucketService: BucketService,
  ) {}
  create(name: string, size: number, description?: string) {
    return this.prismaService.video.create({
      data: {
        name: name,
        size: size,
        userId: 1,

        description: description || "",
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
  updateVideo(videoId: number, body: UpdateVideoDto) {
    return this.prismaService.video.update({
      where: {
        id: Number(videoId),
      },
      data: {
        ...body,
      },
    });
  }

  async updateThumpnile(videoId: number, file: Express.Multer.File) {
    const url = await this.bucketService.uploadFile(file.buffer, uuidv4());
    const data = await this.prismaService.video.update({
      where: {
        id: Number(videoId),
      },
      data: {
        thumbnail_url: url,
      },
    });
    return data;
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
      orderBy: { id: "desc" },
      where: { status: "READY" },
    });
  }
}
