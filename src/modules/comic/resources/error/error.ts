import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type ComicErrorCode =
  | 'COMIC_ERROR_0001'
  | 'COMIC_ERROR_0002'
  | 'COMIC_ERROR_0003'
  | 'COMIC_ERROR_0004'
  | 'CRAWLER_CHAPTER_ERROR_0001';

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
  CRAWLER_CHAPTER_ERROR_0001: {
    errorCode: 'CRAWLER_CHAPTER_ERROR_0001',
    message: 'Không thể cào dữ liệu chương từ đường dẫn!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  COMIC_ERROR_0004: {
    errorCode: 'COMIC_ERROR_0004',
    message: 'Khổng thể thiết lập quyền cho người khởi tạo!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};

export default ComicError;
