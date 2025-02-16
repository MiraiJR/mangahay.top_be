import { ApplicationException } from '@common/exception/application.exception';
import CommonError from '@common/resources/error/error';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

const UserId = createParamDecorator((data: never, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();

  if (!request?.user) {
    throw new ApplicationException(CommonError.COMMON_ERROR_0001);
  }

  return request.user.id;
});

export default UserId;
