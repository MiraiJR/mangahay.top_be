import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from './type';

export class ApplicationException extends Error {
  private readonly statusCode: HttpStatus;
  private readonly errorCode: string;
  constructor(error: ApplicationExceptionModel) {
    super(error.message);
    this.errorCode = error.errorCode;
    this.statusCode = error.statusCode;
  }

  public getStatusCode(): HttpStatus {
    return this.statusCode;
  }

  public getErrorCode(): string {
    return this.errorCode;
  }
}
