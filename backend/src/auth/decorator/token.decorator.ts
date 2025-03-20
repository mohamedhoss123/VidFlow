import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.headers)
    return request.user;
  },
); 
 