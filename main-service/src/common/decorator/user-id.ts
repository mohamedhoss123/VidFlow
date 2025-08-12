import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const userId = request.headers['x-user-id'];
  return userId;
});
