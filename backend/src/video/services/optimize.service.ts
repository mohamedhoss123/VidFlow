import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import { VideoQualityEnum } from "../enums/video-quality.enum";
import { resolutions } from "src/common/constants/resolutions";
@Injectable()
export class OptimizeService {
  async optimizeFile(videoId: string, resulution: VideoQualityEnum) {
    const { videoBitrate, width, height } =
      resolutions[resulution] || resolutions["360p"];
    console.log(videoBitrate, width, height);
    const ffmpegProcess = spawn(
      "ffmpeg",
      [
        "-i",
        "http://localhost:3000/videos/" + videoId, // Input file", // Input file
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
