import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = exception.code;
    if (code == "P2002") {
      return response.status(400).json({
        statusCode: 400,

        message:"EMAIL_ALREADY_EXISTS"
      });
    }


  }
}