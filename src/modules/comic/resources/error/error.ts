import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type ComicErrorCode = 'COMIC_ERROR_0001' | 'COMIC_ERROR_0002' | 'COMIC_ERROR_0003';

const ComicError: Record<ComicErrorCode, ApplicationExceptionModel> = {
  COMIC_ERROR_0001: {
    errorCode: 'COMIC_ERROR_0001',
    message: 'Truyện không tồn tại!',
    statusCode: HttpStatus.NOT_FOUND,
  },
  COMIC_ERROR_0002: {
    errorCode: 'COMIC_ERROR_0002',
    message: 'Không có quyền thao tác trên truyện này!',
    statusCode: HttpStatus.FORBIDDEN,
  },
  COMIC_ERROR_0003: {
    errorCode: 'COMIC_ERROR_0003',
    message:
      'Không thể thực hiện thao tác trên truyện đang ở trạng thái "Tạm ngưng" hoặc "Hoàn thành"! Đưa về trạng thái "Đang tiến hành" để tiếp tục.',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};

export default ComicError;
