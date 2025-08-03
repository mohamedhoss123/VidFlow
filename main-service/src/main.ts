import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

function waitForProto(path: string) {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (existsSync(path)) {
        clearInterval(interval);
        resolve();
      }
    }, 500);
  });
}

async function bootstrap() {
  await waitForProto(join(__dirname, '../video.proto'));

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'video',
        protoPath: join(__dirname, '../video.proto'),
      },
    },
  );
  await app.listen();
}

bootstrap();

