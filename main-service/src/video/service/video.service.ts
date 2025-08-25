import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { CreateVideoRequest, VideoReadyRequest } from 'src/common/proto/video';
import { PrismaService } from 'src/prisma/prisma.service';
import { VideoResponseDto } from '../dto/video.dto';
import { VideoStatus, VideoVisibility } from '@prisma/client';
import { uuidv7 } from 'uuidv7';

@Injectable()
export class VideoService {
  constructor(private readonly prismaService:PrismaService){}

  async create(createVideoDto: CreateVideoRequest) {
    const id = uuidv7()
    await this.prismaService.video.create({data:{
      id,
      name:createVideoDto.url,
      description:createVideoDto.description,
      user_id:createVideoDto.userId,
      likes_count:0,
      comments_count:0,
      visibility:VideoVisibility.public,
      status:VideoStatus.PROCESSING,
      created_at:new Date(),
      qualities:{
        create:[]
      }
    }})
    return {
      videoId:id
    }
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
        status:VideoStatus.READY,
        length:videoReadyRequest.length
      }
    })
  }
}
