import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { BullModule } from '@nestjs/bullmq';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,envFilePath: '.env',
    }),BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    VideoModule,
    PrismaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

