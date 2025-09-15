import { Module } from '@nestjs/common';
import { ThumbnailService } from './service/thumbnail.service';
import { ThumbnailController } from './controller/thumbnail.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MinioService } from 'src/video/service/minio.service';

@Module({
  imports: [PrismaModule],
  controllers: [ThumbnailController],
  providers: [ThumbnailService, MinioService],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
