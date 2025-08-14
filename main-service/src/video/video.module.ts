import { Module } from '@nestjs/common';
import { VideoService } from './service/video.service';
import { VideoController } from './controller/video.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LikeService } from './service/like.service';
import { LikeController } from './controller/like.controller';
import { CommentController } from './controller/comment.controller';
import { CommentService } from './service/comment.service';

@Module({
  imports:[PrismaModule],
  controllers: [VideoController, LikeController, CommentController],
  providers: [VideoService, LikeService, CommentService],
})
export class VideoModule {}
