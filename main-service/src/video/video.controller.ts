import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoRequest } from 'src/common/proto/video';

@Controller()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @GrpcMethod('VideoService', 'CreateVideo')

  create(@Payload() createVideoDto: CreateVideoRequest) {
    return this.videoService.create(createVideoDto);
  }

}
