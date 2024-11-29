import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type CommonErrorCode =
  | 'COMMON_ERROR_0001'
  | 'COMMON_ERROR_0002'
  | 'COMMON_ERROR_0003'
  | 'COMMON_ERROR_0004'
  | 'COMMON_ERROR_0005';

const CommonError: Record<CommonErrorCode, ApplicationExceptionModel> = {
  COMMON_ERROR_0001: {
    errorCode: 'COMMON_ERROR_0001',
    message: 'Máy chủ lỗi',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  COMMON_ERROR_0002: {
    errorCode: 'COMMON_ERROR_0002',
    message: 'Không thể gửi mail',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  COMMON_ERROR_0003: {
    errorCode: 'COMMON_ERROR_0003',
    message: 'Unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  COMMON_ERROR_0004: {
    errorCode: 'COMMON_ERROR_0004',
    message: 'ValidationError',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  COMMON_ERROR_0005: {
    errorCode: 'COMMON_ERROR_0005',
    message: 'Quá trình tìm kiếm xảy ra lỗi!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};

export default CommonError;
