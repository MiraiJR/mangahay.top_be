import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import CommonError from '@common/resources/error/error';
import { ApplicationException } from './application.exception';

@Catch(Error)
export class UnknownExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    if (exception instanceof ApplicationException) {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(CommonError.COMMON_ERROR_0001.statusCode).json({
      statusCode: CommonError.COMMON_ERROR_0001.statusCode,
      errorCode: CommonError.COMMON_ERROR_0001.errorCode,
      message: CommonError.COMMON_ERROR_0001.message,
      cause: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
