import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'node:path';
  
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'video',
        protoPath: join(__dirname, 'proto/video.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );
  await app.listen();
  console.log('gRPC server is listening on 0.0.0.0:50051');
}

bootstrap();

