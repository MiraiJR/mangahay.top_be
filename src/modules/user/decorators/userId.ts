import { ExecutionContext, createParamDecorator } from '@nestjs/common';

const UserId = createParamDecorator((data: never, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.idUser;
});

export default UserId;
