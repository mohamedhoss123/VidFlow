import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  Patch,
  UseInterceptors,
  UseFilters,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { VideoService } from "./services/video.service";
import { UploadVideoDto } from "./dto/upload-video.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { BucketService } from "./services/bucket.service";
import Stream from "stream";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { UpdateVideoDto } from "./dto/update-video.dto";
import { CreateThumpnileDto } from "./dto/update-thumpnile.dto";
import { NoSuchKeyExceptionFilter } from "./exceptions/no-such-key.filter";
// import { AuthGuard } from "src/auth/guard/auth.guard";
@UseFilters(new NoSuchKeyExceptionFilter())
@ApiBearerAuth()
@Controller("videos")
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly bucketService: BucketService,
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
    const videoUrl = await this.bucketService.uploadFile(file.buffer, uuidv4());
    const video = await this.videoService.create(
      data.name,
      file.size,
      data.description,
    );
    await this.videoQueue.add("optomizeFile", {
      videoId: videoUrl,
      id: video.id,
    });
    return video;
  }
  @ApiConsumes("multipart/form-data")
  @Patch("/:id")
  async updateVideo(@Param("id") id: number, @Body() body: UpdateVideoDto) {
    return this.videoService.updateVideo(id, body);
  }
  @Patch("/:id/thumpnile")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateThumpnileDto })
  @UseInterceptors(FileInterceptor("thumpmile"))
  async uploadThumpnile(
    @Param("id") id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.updateThumpnile(id, file);
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
  // @Get('/my')
  // async getMyVideos(@Query("cursor") cursor?: number) {
  //   return this.videoService.cursorPagination(cursor, true);
  // }
  @Get()
  async getVideos(@Query("cursor") cursor?: number) {
    return this.videoService.cursorPagination(cursor);
  }
}
