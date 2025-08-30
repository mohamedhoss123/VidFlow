import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { Client } from 'minio';
@Injectable()
export class MinioService {
    private minioClient: Client;
    private bucket = 'videos';
    constructor(){

          this.minioClient = new Client({ 
            // endPoint: process.env.S3_ENDPOINT||"",
            endPoint:"minio",
            port: 9000,
            useSSL: false,
            accessKey: process.env.S3_USERNAME||"", 
            secretKey: process.env.S3_PASSWORD||"",
          }); 
    }

    async streamFile(key: string): Promise<Readable> {
        return await this.minioClient.getObject(this.bucket, key);
    }

    async getSignedUrl(objectId: string, expiry: number = 3600): Promise<string> {
        return await this.minioClient.presignedGetObject(this.bucket, objectId, expiry);
    }
}
