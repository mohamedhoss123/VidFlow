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
import { v4 as uuidv4 } from 'uuid';
import { VideoService } from './services/video.service';
import { UploadVideoDto } from './dto/upload-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { FileUploadService } from './services/file-upload.service';
import Stream from 'stream';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService,private readonly fileUploadService:FileUploadService,@InjectQueue("video-queue")private videoQueue: Queue) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() data: UploadVideoDto,@UploadedFile()file:Express.Multer.File) {
    const videoUrl = await this.fileUploadService.uploadFile(file.buffer,uuidv4())
    const video = await this.videoService.create(data.name,videoUrl,file.size)
    this.videoQueue.add("optomizeFile", { videoId: videoUrl,id:video.id })

  }
  // @Get("/:id")
  // async getVideo(@Param("id") id: string, @Res() res: any) {
  //   const videoPath = (await this.videoService.optomizeFile(id));
  //   const videoStream = fs.createReadStream(videoPath)
  //   const stats = await fs.promises.stat(videoPath);
  //   console.log(`Video length: ${stats.size} bytes`)
  //   videoStream.on("end", () => {
  //     fs.unlinkSync(videoPath);
  //   })
  //   res.setHeader('Content-Type', 'video/mp4');
  //   videoStream.pipe(res);
  // }
  @Get("/:id")
  async getVideo(@Param("id") id: string, @Res() res: any) {

    const videoStream = await this.videoService.getVideoStream(id) as Stream
  
    videoStream.pipe(res);
  }
}


