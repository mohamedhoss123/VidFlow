import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { VideoModule } from "./video/video.module";
import { AuthModule } from "./auth/auth.module";
import { ThumbnailModule } from "./thumbnail/thumbnail.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    VideoModule,
    AuthModule,
    ThumbnailModule,

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
