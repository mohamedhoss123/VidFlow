import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { CreateVideoRequest, VideoReadyRequest } from 'src/common/proto/video';
import { PrismaService } from 'src/prisma/prisma.service';
import { VideoResponseDto } from '../dto/video.dto';
import { VideoStatus } from '@prisma/client';

@Injectable()
export class VideoService {
  constructor(private readonly prismaService:PrismaService){}
  create(createVideoDto: CreateVideoRequest) {
    // this.prismaService.video.create({})
  }

  getVideoWithQualities( videoId: string) {
    return this.prismaService.video.findUnique({ where: { id: videoId } ,include:{qualities:true}});
  }

  async makeVideoReady(videoReadyRequest: VideoReadyRequest) {
    await this.prismaService.videoQuality.createMany({data:videoReadyRequest.quality.map((quality)=>{
      return {
        id:quality.id,
        quality:quality.quality,
        video_id:videoReadyRequest.videoId,
        objectId:quality.objectId,
      }
    })})
    await this.prismaService.video.update({
      where:{id:videoReadyRequest.videoId},
      data:{
        status:VideoStatus.READY
      }
    })
  }
}
