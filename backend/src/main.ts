import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

dotenv.config();

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle("API Documentation")
    .setDescription("NestJS API with Swagger")
    .setVersion("1.0")
    .addBearerAuth({
      name: "authorization",
      description: "Enter   token",
      scheme: "bearer",
      type: "http",
      in: "header",
    }) // Adds JWT Authentication (optional)
    .build();
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
