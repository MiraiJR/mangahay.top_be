import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from '@common/exception/application-exception.interface';

type UserErrorCode = 'USER_ERROR_0001';

const UserError: Record<UserErrorCode, ApplicationExceptionModel> = {
  USER_ERROR_0001: {
    errorCode: 'USER_ERROR_0001',
    message: 'Người dùng không tồn tại',
    statusCode: HttpStatus.NOT_FOUND,
  },
};

export default UserError;
