import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { CreateVideoRequest } from 'src/common/proto/video';
import { PrismaService } from 'src/prisma/prisma.service';
import { VideoResponseDto } from '../dto/video.dto';

@Injectable()
export class VideoService {
  constructor(private readonly prismaService:PrismaService){}
  create(createVideoDto: CreateVideoRequest) {
    // this.prismaService.video.create({})
  }

  getVideoWithQualities( videoId: string) {
    return this.prismaService.video.findUnique({ where: { id: videoId } ,include:{qualities:true}});
  }
}
