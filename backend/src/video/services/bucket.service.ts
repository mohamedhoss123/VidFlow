import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
// import { Stream } from "stream";
@Injectable()
export class BucketService {
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

  async getVideo(key: string) {
    return await this.client.send(
      new GetObjectCommand({
        Bucket: "files",
        Key: key,
      }),
    );
  }
}
