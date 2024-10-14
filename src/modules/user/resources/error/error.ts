import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type UserErrorCode = 'USER_ERROR_0001';

const UserError: Record<UserErrorCode, ApplicationExceptionModel> = {
  USER_ERROR_0001: {
    errorCode: 'USER_ERROR_0001',
    message: 'Người dùng không tồn tại',
    statusCode: HttpStatus.NOT_FOUND,
  },
};

export default UserError;
