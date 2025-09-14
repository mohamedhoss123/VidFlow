import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { VideoVisibility } from "@prisma/client";
@Injectable()
export class VideoGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const videoId = request.params.id;
    const userId = request.headers["x-user-id"];
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });
    if (!video) {
      throw new ForbiddenException("Video not found");
    }

    console.log(userId);
    console.log(video.user_id);
    if (
      video.user_id !== userId &&
      video.visibility == VideoVisibility.private
    ) {
      throw new ForbiddenException("Access denied");
    }
    return true;
  }
}
