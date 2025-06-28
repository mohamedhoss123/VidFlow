import { NoSuchKey } from "@aws-sdk/client-s3";
import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";

@Catch(NoSuchKey)
export class NoSuchKeyExceptionFilter implements ExceptionFilter {
  catch(exception: NoSuchKey, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(404).json({ message: "File not found" });
  }
}
