import { Injectable } from '@nestjs/common';
import { S3Client, ListBucketsCommand, PutObjectCommand, } from "@aws-sdk/client-s3";
@Injectable()
export class FileUploadService {
    private readonly client=new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
      endpoint: "http://localhost:9000",
      forcePathStyle: true,
    });


  

    async uploadFile(file: Buffer, filename: string) {
      const data = await this.client.send(
        new PutObjectCommand({
          Bucket: "files",
          Key: filename,
          Body: file,
        })
      );
      console.log("Success", data);
      return data;
    }

}