import { Controller, Get, Query ,Param, Headers, UsePipes, Res, ValidationPipe, UseGuards} from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { VideoService } from '../service/video.service';
import { MinioService } from '../service/minio.service';
import { CreateVideoRequest, CreateVideoResponse, VideoReadyRequest } from 'src/common/proto/video';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {VideoResponseDto } from '../dto/video.dto';
import { VideoGuard } from '../guard/video.guard';
import {type Response} from "express"
import { VideoPaginationDto } from '../dto/video-pagination.dto';
@ApiBearerAuth('access-token') // Match name in addBearerAuth 
@Controller("video")
export class VideoController {
  constructor(private readonly videoService: VideoService,private readonly minioService: MinioService) {}

  @GrpcMethod('VideoService', 'CreateVideo')
  async create(@Payload() createVideoDto: CreateVideoRequest):Promise<CreateVideoResponse> {
    return await(this.videoService.create(createVideoDto));
  }

  @GrpcMethod('VideoService', 'MakeVideoReady')
  makeVideoReady(@Payload() videoReadyRequest: VideoReadyRequest) {
    this.videoService.makeVideoReady(videoReadyRequest);
  }
  @Get()
  async getVideos(@Query() query:VideoPaginationDto){
    return this.videoService.getVideos(query);
  }



  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(VideoGuard)
  @ApiOperation({ summary: 'Get video details and qualities if user has permission' })
  @ApiResponse({ status: 200, description: 'Video details with qualities', type: VideoResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getVideo(@Param("id") params:string) {
    console.log(params)
    return this.videoService.getVideoWithQualities(params);
  }
  @Get('download/:key')
  async download(@Param('key') key: string, @Res() res: Response) {
    const stream = await this.minioService.streamFile(key);

    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    stream.pipe(res);
  }

}