import { BadRequestException, Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import { PrismaService } from "src/prisma/prisma.service";
import { VideoQualityEnum } from "../enums/video-quality.enum";
import { BucketService } from "./bucket.service";
import * as fs from "fs";
@Injectable()
export class OptomizeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bucketService: BucketService,
  ) {}
  async optomizeFile(videoId: string, resulution: VideoQualityEnum) {
    const inputStream = (
      await this.bucketService.getVideo(videoId)
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
        stdio: "inherit",
        shell: true,
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
}
