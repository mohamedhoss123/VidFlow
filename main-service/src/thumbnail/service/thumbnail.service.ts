import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioService } from 'src/video/service/minio.service';
import { 
  UploadThumbnailRequest, 
  UploadThumbnailResponse, 
  GetThumbnailRequest, 
  GetThumbnailResponse 
} from 'src/common/proto/thumbnail';

@Injectable()
export class ThumbnailService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async uploadThumbnail(request: UploadThumbnailRequest): Promise<UploadThumbnailResponse> {
    try {
      // Check if video exists
      const video = await this.prismaService.video.findUnique({
        where: { id: request.videoId },
      });

      if (!video) {
        return {
          success: false,
          message: `Video with ID ${request.videoId} not found`,
        };
      }

      // Update video with thumbnail object ID
      await this.prismaService.video.update({
        where: { id: request.videoId },
        data: { thumbnail_object_id: request.thumbnailObjectId },
      });

      return {
        success: true,
        message: 'Thumbnail uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      return {
        success: false,
        message: 'Failed to upload thumbnail',
      };
    }
  }

  async getThumbnail(request: GetThumbnailRequest): Promise<GetThumbnailResponse> {
    try {
      const video = await this.prismaService.video.findUnique({
        where: { id: request.videoId },
        select: { id: true, thumbnail_object_id: true },
      });

      if (!video) {
        throw new NotFoundException(`Video with ID ${request.videoId} not found`);
      }

      const hasThumbnail = !!video.thumbnail_object_id;
      let thumbnailUrl = '';

      if (hasThumbnail && video.thumbnail_object_id) {
        // Generate signed URL for thumbnail
        thumbnailUrl = await this.minioService.getSignedUrl(video.thumbnail_object_id);
      }

      return {
        videoId: request.videoId,
        thumbnailObjectId: video.thumbnail_object_id || '',
        thumbnailUrl,
        hasThumbnail,
      };
    } catch (error) {
      console.error('Error getting thumbnail:', error);
      return {
        videoId: request.videoId,
        thumbnailObjectId: '',
        thumbnailUrl: '',
        hasThumbnail: false,
      };
    }
  }
}
