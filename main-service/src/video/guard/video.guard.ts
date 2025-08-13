import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VideoGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const videoId = request.params.id;
    const userId = request.headers['x-user-id'];
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      throw new ForbiddenException('Video not found');
    }
    
    console.log(userId)
    console.log(video.user_id)
    if (video.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
