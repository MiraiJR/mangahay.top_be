import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from '@common/exception/application-exception.interface';

type CommonErrorCode =
  | 'COMMON_ERROR_0001'
  | 'COMMON_ERROR_0002'
  | 'COMMON_ERROR_0003'
  | 'COMMON_ERROR_0004'
  | 'COMMON_ERROR_0005'
  | 'COMMON_ERROR_0006';

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
    message: 'Lỗi liên quan đến xác thực dữ liệu!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  COMMON_ERROR_0005: {
    errorCode: 'COMMON_ERROR_0005',
    message: 'Quá trình tìm kiếm xảy ra lỗi!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  COMMON_ERROR_0006: {
    errorCode: 'COMMON_ERROR_0006',
    message: 'Lỗi xảy ra trong quá trình cào dữ liệu!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};

export default CommonError;
