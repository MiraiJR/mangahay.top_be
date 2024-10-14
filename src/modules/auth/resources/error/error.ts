import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type AuthErrorCode =
  | 'AUTH_ERROR_0001'
  | 'AUTH_ERROR_0002'
  | 'AUTH_ERROR_0003'
  | 'AUTH_ERROR_0004'
  | 'AUTH_ERROR_0005';

const AuthError: Record<AuthErrorCode, ApplicationExceptionModel> = {
  AUTH_ERROR_0001: {
    errorCode: 'AUTH_ERROR_0001',
    message: 'Email đã được sử dụng',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  AUTH_ERROR_0002: {
    errorCode: 'AUTH_ERROR_0002',
    message: 'Thông tin đăng nhập không chính xác',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  AUTH_ERROR_0003: {
    errorCode: 'AUTH_ERROR_0003',
    message: 'Thông tin đăng nhập không chính xác',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  AUTH_ERROR_0004: {
    errorCode: 'AUTH_ERROR_0004',
    message: 'Token không hợp lệ',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  AUTH_ERROR_0005: {
    errorCode: 'AUTH_ERROR_0005',
    message: 'Token đã hết hạn',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};

export default AuthError;
