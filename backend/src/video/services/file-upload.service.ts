import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
// import { Stream } from "stream";
@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {}
  private readonly client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: this.configService.get("AWS_ACCESS_KEY") as string,
      secretAccessKey: this.configService.get("AWS_SECRET_KEY") as string,
    },
    endpoint: this.configService.get("AWS_ENDPOINT"),
    forcePathStyle: true,
  });

  async uploadFile(file: Buffer, key: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: "files",
        Key: key,
        Body: file,
      }),
    );
    return key;
  }

  // streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  //   return new Promise<Buffer>((resolve, reject) => {
  //     const chunks: Buffer[] = [];
  //     stream.on("data", (chunk: Buffer) => chunks.push(chunk));
  //     stream.on("end", () => resolve(Buffer.concat(chunks)));
  //     stream.on("error", reject);
  //   });
  // }
  async getVideo(key: string) {
    const data = await this.client.send(
      new GetObjectCommand({
        Bucket: "files",
        Key: key,
      }),
    );

    return data;
  }
}
