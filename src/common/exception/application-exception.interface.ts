import { HttpStatus } from '@nestjs/common';

export interface ApplicationExceptionModel {
  errorCode: string;
  message: string;
  statusCode: HttpStatus;
  rootCause?: string;
}
