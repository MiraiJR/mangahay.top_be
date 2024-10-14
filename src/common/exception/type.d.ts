import { HttpStatus } from '@nestjs/common';

interface ApplicationExceptionModel {
  errorCode: string;
  message: string;
  statusCode: HttpStatus;
}
