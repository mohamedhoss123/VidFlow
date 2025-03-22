import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, } from "@aws-sdk/client-s3";
import { ConfigService } from '@nestjs/config';
@Injectable()
export class FileUploadService {
    constructor(private readonly configService:ConfigService){}
    private readonly client=new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY")as string,
        secretAccessKey: this.configService.get("AWS_SECRET_KEY")as string,
      },
      endpoint: this.configService.get("AWS_URL"),
      forcePathStyle: true,
    });
    
    async uploadFile(file: Express.Multer.File, filename: string) {
      const key = `${uuidv4()}${file.originalname}`
      const data = await this.client.send(
        new PutObjectCommand({
          Bucket: "files",
          Key: key,
          Body: file.buffer,
        })
      );
      return key;
    }

    streamToString(stream): Promise<Buffer> {
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    }
    async getVideoStream(key: string) { 
      const data = await this.client.send(
        new GetObjectCommand({
          Bucket: "files",
          Key: key,
        })
      );
      return data.Body;
    }
    
}