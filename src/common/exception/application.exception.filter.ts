import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ApplicationException } from './application.exception';
import { Request, Response } from 'express';

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatusCode();

    response.status(status).json({
      statusCode: status,
      errorCode: exception.getErrorCode(),
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
