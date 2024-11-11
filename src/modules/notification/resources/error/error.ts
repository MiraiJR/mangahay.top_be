import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type NotificationErrorCode = 'NOTIFICATION_ERROR_0001' | 'NOTIFICATION_ERROR_0002';

const NotificationError: Record<NotificationErrorCode, ApplicationExceptionModel> = {
  NOTIFICATION_ERROR_0001: {
    errorCode: 'NOTIFICATION_ERROR_0001',
    message: 'Thông báo không tồn tại!',
    statusCode: HttpStatus.NOT_FOUND,
  },
  NOTIFICATION_ERROR_0002: {
    errorCode: 'NOTIFICATION_ERROR_0002',
    message: 'Không có quyền thao tác trên thông báo này!',
    statusCode: HttpStatus.NOT_FOUND,
  },
};

export default NotificationError;
