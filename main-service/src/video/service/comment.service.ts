import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { uuidv7 } from "uuidv7";
import { CommentPaginationDto } from "../dto/comment-pagination.dto";
@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async addComment(userId: string, videoId: string, content: string) {
    const comment = await this.prismaService.comments.create({
      data: {
        id: uuidv7(),
        user_id: userId,
        video_id: videoId,
        content: content,
        created_at: new Date(),
      },
      include: {
        user: {
          select: {
            name: true, // or "username" if your column is called that
          },
        },
      },
    });
    await this.prismaService.video.update({
      where: { id: videoId },
      data: { comments_count: { increment: 1 } },
    });
    return comment;
  }

  async removeComment(userId: string, videoId: string) {
    await this.prismaService.comments.deleteMany({
      where: { user_id: userId, video_id: videoId },
    });
    await this.prismaService.video.update({
      where: { id: videoId },
      data: { comments_count: { decrement: 1 } },
    });
  }
  async getComment(videoId: string, query: CommentPaginationDto) {
    const comments = await this.prismaService.comments.findMany({
      take: query.limit,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      where: { video_id: videoId },
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    return {
      comments,
      nextCursor,
    };
  }
}
