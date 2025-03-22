import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { VideoService } from './services/video.service';
import { UploadVideoDto } from './dto/upload-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { FileUploadService } from './services/file-upload.service';
import * as fs from "fs";
import Stream from 'stream';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService,private readonly fileUploadService:FileUploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() data: UploadVideoDto,@UploadedFile()file:Express.Multer.File) {
    const videoUrl = await this.fileUploadService.uploadFile(file,data.name)
    return await this.videoService.create(data.name,videoUrl,file.size)

  }
  @Get("/:id")
  async getVideo(@Param("id") id: string, @Res() res: any) {
    const videoPath = await this.videoService.optomizeFile(id);
    const videoStream = fs.createReadStream(videoPath)
    videoStream.on("end", () => {
      fs.unlinkSync(videoPath);
    })
    res.setHeader('Content-Type', 'video/mp4');
    videoStream.pipe(res);
  }
}


