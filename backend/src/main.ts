import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
  const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('NestJS API with Swagger')
  .setVersion('1.0')
  .addBearerAuth() // Adds JWT Authentication (optional)
  .build();
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

