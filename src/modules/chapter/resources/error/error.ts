import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type ChapterErrorCode =
  | 'CHAPTER_ERROR_0001'
  | 'CHAPTER_ERROR_0002'
  | 'CHAPTER_ERROR_0003'
  | 'CHAPTER_ERROR_0004';

const ChapterError: Record<ChapterErrorCode, ApplicationExceptionModel> = {
  CHAPTER_ERROR_0001: {
    errorCode: 'CHAPTER_ERROR_0001',
    message: 'Chương không tồn tại',
    statusCode: HttpStatus.NOT_FOUND,
  },
  CHAPTER_ERROR_0002: {
    errorCode: 'CHAPTER_ERROR_0002',
    message: 'Chương ở vị trí này đã tồn tại!',
    statusCode: HttpStatus.NOT_FOUND,
  },
  CHAPTER_ERROR_0003: {
    errorCode: 'CHAPTER_ERROR_0003',
    message: 'Chương phải có ít nhất 1 ảnh!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  CHAPTER_ERROR_0004: {
    errorCode: 'CHAPTER_ERROR_0004',
    message: 'Chương đang thực thi không thuộc cùng một truyện!',
    statusCode: HttpStatus.BAD_REQUEST,
  },
};

export default ChapterError;
