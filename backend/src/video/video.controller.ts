import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { VideoService } from './video.service';
import { UploadVideoDto } from './dto/upload-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService,private readonly fileUploadService:FileUploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() data: UploadVideoDto,@UploadedFile()file:Express.Multer.File) {
    await this.fileUploadService.uploadFile(file.buffer,data.name)
  }
}


