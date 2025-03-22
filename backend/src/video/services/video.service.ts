import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadService } from './file-upload.service';
import { spawn } from "child_process";
import * as fs from "fs";
@Injectable()
export class VideoService {
    constructor(private readonly prismaService: PrismaService, private readonly fileUploadService: FileUploadService) { }
    create(name: string, url: string, size: number) {
        return this.prismaService.video.create({
            data: {
                name: name,
                url: url,
                size: size
            }
        })
    }

    async optomizeFile(videoId: string) {
        const inputStream = await this.fileUploadService.getVideoStream(videoId);
        const input = await this.fileUploadService.streamToString(inputStream);
        console.log(input)
        const tempInputFilePath = "./temp_input";
        fs.writeFileSync(tempInputFilePath, input);

        const ffmpegProcess = spawn("ffmpeg", [
            "-i", tempInputFilePath,  // Input file
            "-c:v", "h264_nvenc",   // Encode video with H.264
            "-preset", "fast",
            "-f", "mp4",         // Output format
            "./optimized-" + videoId + ".mp4"  // Output file
        ]);

        return new Promise<string>((resolve, reject) => {
            console.log("enter")
            ffmpegProcess.on("close", (code) => {
     
                if (code === 0) {
                    console.log("vvsaw")
                    resolve("./optimized-" + videoId + ".mp4");
                } else {
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            ffmpegProcess.on('error', (err) => {
                reject(err);
            });
        });
    }

}
