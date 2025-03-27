import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { FileUploadService } from "./file-upload.service";
import { spawn } from "child_process";
import * as fs from "fs";
import { VideoQualityEnum } from "../enums/video-quality.enum";
@Injectable()
export class VideoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  create(name: string, url: string, size: number) {
    return this.prismaService.video.create({
      data: {
        name: name,
        url: undefined,
        size: size,
        userId: 1,
      },
    });
  }

  async optomizeFile(videoId: string, resulution: VideoQualityEnum) {
    const inputStream = (
      await this.fileUploadService.getVideo(videoId)
    ).Body?.transformToByteArray();
    if (!inputStream) {
      throw new BadRequestException();
    }
    const tempInputFilePath = "./temp_input";
    fs.writeFileSync(tempInputFilePath, await inputStream);
    const resolutions: Record<
      string,
      { videoBitrate: string; width: number; height: number }
    > = {
      "144p": {
        videoBitrate: "200k",
        width: 256,
        height: 144,
      },
      "360p": {
        videoBitrate: "800k",
        width: 640,
        height: 360,
      },
      "720p": {
        videoBitrate: "2500k",
        width: 1280,
        height: 720,
      },
    };
    const { videoBitrate, width, height } =
      resolutions[resulution] || resolutions["360p"];
    console.log(videoBitrate, width, height);
    const ffmpegProcess = spawn(
      "ffmpeg",
      [
        "-i",
        tempInputFilePath, // Input file
        "-c:v",
        "h264_nvenc", // Encode video with H.264
        "-preset",
        "fast",
        "-hls_list_size",
        "0", // No limit on number of segments
        "-hls_segment_filename",
        `./video/${videoId}-%03d.tss`, // Segment filename
        "./video/optimized-" + videoId + ".m3u8", // Output file
      ],
      {
        // stdio: "inherit",
        // shell: true,
      },
    );

    return new Promise<string>((resolve, reject) => {
      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          fs.unlinkSync(tempInputFilePath);
          resolve("./optimized-" + videoId + ".m3u8");
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpegProcess.on("error", (err) => {
        reject(err);
      });
    });
  }

  async getVideoStream(videoId: string) {
    const data = await this.fileUploadService.getVideo(videoId);
    await this.prismaService.userBandwidthSummary.create({
      data: {
        total: (data.ContentLength as number) / 1024,
        userId: 1,
      },
    });
    if (data.Body) return data.Body;
    else throw new BadRequestException();
  }
}
