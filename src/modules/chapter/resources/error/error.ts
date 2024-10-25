import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from 'src/common/exception/type';

type ChapterErrorCode = 'CHAPTER_ERROR_0001';

const ChapterError: Record<ChapterErrorCode, ApplicationExceptionModel> = {
  CHAPTER_ERROR_0001: {
    errorCode: 'CHAPTER_ERROR_0001',
    message: 'Chương không tồn tại',
    statusCode: HttpStatus.NOT_FOUND,
  },
};

export default ChapterError;
