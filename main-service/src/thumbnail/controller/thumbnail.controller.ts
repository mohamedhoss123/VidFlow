import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ThumbnailService } from '../service/thumbnail.service';
import { 
  UploadThumbnailRequest, 
  UploadThumbnailResponse, 
  GetThumbnailRequest, 
  GetThumbnailResponse 
} from 'src/common/proto/thumbnail';

@Controller()
export class ThumbnailController {
  constructor(private readonly thumbnailService: ThumbnailService) {}

  @GrpcMethod('ThumbnailService', 'UploadThumbnail')
  async uploadThumbnail(request: UploadThumbnailRequest): Promise<UploadThumbnailResponse> {
    return this.thumbnailService.uploadThumbnail(request);
  }

  @GrpcMethod('ThumbnailService', 'GetThumbnail')
  async getThumbnail(request: GetThumbnailRequest): Promise<GetThumbnailResponse> {
    return this.thumbnailService.getThumbnail(request);
  }
}
