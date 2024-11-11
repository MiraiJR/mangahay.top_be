import { HttpStatus } from '@nestjs/common';
import { ApplicationExceptionModel } from './type';

export class ApplicationException extends Error {
  private readonly statusCode: HttpStatus;
  private readonly errorCode: string;
  private readonly rootCause: string;
  constructor(error: ApplicationExceptionModel) {
    super(error.message);
    this.errorCode = error.errorCode;
    this.statusCode = error.statusCode;
    this.rootCause = error.rootCause ?? '';
  }

  public getStatusCode(): HttpStatus {
    return this.statusCode;
  }

  public getErrorCode(): string {
    return this.errorCode;
  }

  public getRootCause(): string {
    return this.rootCause;
  }
}
