import { ForbiddenException, HttpException, Injectable } from "@nestjs/common";
import { CreateVideoDto } from "../dto/create-video.dto";
import { UpdateVideoDto } from "../dto/update-video.dto";
import { CreateVideoRequest, VideoReadyRequest } from "src/common/proto/video";
import { PrismaService } from "src/prisma/prisma.service";
import { VideoResponseDto } from "../dto/video.dto";
import { VideoStatus, VideoVisibility } from "@prisma/client";
import { uuidv7 } from "uuidv7";
import { VideoPaginationDto } from "../dto/video-pagination.dto";

@Injectable()
export class VideoService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createVideoDto: CreateVideoRequest) {
    const id = uuidv7();
    await this.prismaService.video.create({
      data: {
        id,
        name: createVideoDto.url,
        description: createVideoDto.description,
        user_id: createVideoDto.userId,
        likes_count: 0,
        comments_count: 0,
        visibility: VideoVisibility.public,
        status: VideoStatus.PROCESSING,
        created_at: new Date(),
        qualities: {
          create: [],
        },
      },
    });
    return {
      videoId: id,
    };
  }

  async getVideoWithQualities(videoId: string, userId: string) {
    const data = await this.prismaService.video.findUnique({
      where: { id: videoId },
      include: {
        qualities: { omit: { video_id: true, created_at: true } },
        user: { omit: { password: true, email: true } },
      },
    });

    if (data?.user) {
      const isSubscribed =
        (await this.prismaService.subscription.count({
          where: {
            following_id: data.user.id,
            follower_id: userId,
          },
        })) > 0;
      console.log(isSubscribed);
      return { ...data, isSubscribed };
    }
    throw new HttpException("the video creator not found", 400);
  }

  async makeVideoReady(videoReadyRequest: VideoReadyRequest) {
    await this.prismaService.videoQuality.createMany({
      data: videoReadyRequest.quality.map((quality) => {
        return {
          id: quality.id,
          quality: quality.quality,
          video_id: videoReadyRequest.videoId,
          objectId: quality.objectId,
        };
      }),
    });
    await this.prismaService.video.update({
      where: { id: videoReadyRequest.videoId },
      data: {
        status: VideoStatus.READY,
        length: videoReadyRequest.length,
      },
    });
  }

  async getVideos(videoPaginationDto: VideoPaginationDto) {
    const videos = await this.prismaService.video.findMany({
      take: videoPaginationDto.limit,
      skip: videoPaginationDto.cursor ? 1 : 0,
      cursor: videoPaginationDto.cursor
        ? { id: videoPaginationDto.cursor }
        : undefined,
      where: { visibility: VideoVisibility.public, status: VideoStatus.READY },
      orderBy: {
        id: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    const nextCursor = videos.length > 0 ? videos[videos.length - 1].id : null;

    return {
      videos,
      nextCursor,
    };
  }
}
