import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { VideoPaginationDto } from "src/video/dto/video-pagination.dto";
import { VideoStatus, VideoVisibility } from "@prisma/client";
@Injectable()
export class SubscriptionService {
  constructor(private readonly prismaService: PrismaService) {}

  getUserSubscriptions(userId: string) {
    return this.prismaService.subscription.findMany({
      where: { follower_id: userId },
      include: {
        following: true,
      },
    });
  }

  async getUserSubscriptionsVideos(userId: string, query: VideoPaginationDto) {
    console.log(query.cursor ?? null);
    const videos = await this.prismaService.$queryRawUnsafe<
      {
        video_id: string;
        video_title: string;
        video_thumbnail: string;
        user_id: string;
        username: string;
        profile_image: string;
        created_at: Date;
        length: Number;
      }[]
    >(
      `
      SELECT
      v.id as video_id,
      v.length as length,
      v.name as video_name,
      u.name as username,
      u.id as user_id
      FROM "Subscription" s
      LEFT JOIN "Users" u
        ON s.following_id = u.id
      LEFT JOIN "Video" v
        ON v.user_id = s.following_id
      WHERE s.follower_id = $1
      ${query.cursor ? "AND v.id < $2" : ""}
      ORDER BY v.id DESC
      LIMIT $3;
      `,
      userId, // $1
      query.cursor ?? 1, // $2 (the last video id)
      query.limit ?? 10, // $3
    );
    const nextCursor =
      videos.length > 0 ? videos[videos.length - 1].video_id : null;

    return {
      videos,
      nextCursor,
    };
  }
  subscribe(userId: string, targetId: string) {
    return this.prismaService.subscription.create({
      data: { follower_id: userId, following_id: targetId },
    });
  }

  unSubscribe(userId: string, targetId: string) {
    return this.prismaService.subscription.deleteMany({
      where: { follower_id: userId, following_id: targetId },
    });
  }
}
