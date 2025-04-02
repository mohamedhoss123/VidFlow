import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { VideoService } from "./services/video.service";
import { UploadVideoDto } from "./dto/upload-video.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { FileUploadService } from "./services/file-upload.service";
import Stream from "stream";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
// import { AuthGuard } from "src/auth/guard/auth.guard";
@ApiBearerAuth()
@Controller("videos")
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly fileUploadService: FileUploadService,
    @InjectQueue("video-queue") private videoQueue: Queue,
  ) {}
  // @UseGuards(AuthGuard)
  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @Body() data: UploadVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const videoUrl = await this.fileUploadService.uploadFile(
      file.buffer,
      uuidv4(),
    );
    const video = await this.videoService.create(
      data.name,
      videoUrl,
      file.size,
    );
    await this.videoQueue.add("optomizeFile", {
      videoId: videoUrl,
      id: video.id,
    });
    return video;
  }
  @Get("/:id/info")
  async videoInfo(@Param("id") id: number) {
    return this.videoService.getVideoInfo(id);
  }
  @Get("/:id")
  async getVideo(@Param("id") id: string, @Res() res: any) {
    const videoStream = (await this.videoService.getVideoStream(id)) as Stream;

    videoStream.pipe(res);
  }
}
