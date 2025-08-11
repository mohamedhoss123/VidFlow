import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'node:path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import  cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'video',
        protoPath: join(__dirname, 'proto/video.proto'),
        url: '0.0.0.0:50051',
      },
    },
  );  
  app.setGlobalPrefix("api")
   const config = new DocumentBuilder()
    .setTitle('Videflow') 
    .setDescription('The Vidflow API description')
    .setBasePath('/api')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // This name must match @ApiBearerAuth() decorator
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  await app.startAllMicroservices()
  await app.listen(3000);
}

bootstrap();

