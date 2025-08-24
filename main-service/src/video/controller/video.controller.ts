import { Controller, Get, Query ,Param, Headers, UsePipes, Req, ValidationPipe, UseGuards} from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { VideoService } from '../service/video.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { CreateVideoRequest, VideoReadyRequest } from 'src/common/proto/video';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetVideoDto, VideoResponseDto } from '../dto/video.dto';
import { VideoGuard } from '../guard/video.guard';
@ApiBearerAuth('access-token') // Match name in addBearerAuth 
@Controller("video")
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @GrpcMethod('VideoService', 'CreateVideo')
  create(@Payload() createVideoDto: CreateVideoRequest) {
    return this.videoService.create(createVideoDto);
  }

  @GrpcMethod('VideoService', 'MakeVideoReady')
  makeVideoReady(@Payload() videoReadyRequest: VideoReadyRequest) {
    console.log(videoReadyRequest)
    return this.videoService.makeVideoReady(videoReadyRequest);
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

}