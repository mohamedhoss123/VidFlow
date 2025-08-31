import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { VideoModule } from './video/video.module';
import { AuthModule } from './auth/auth.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';

@Module({
  imports: [PrismaModule, VideoModule, AuthModule, ThumbnailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
