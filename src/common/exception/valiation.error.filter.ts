import { ArgumentsHost, Catch, ExceptionFilter, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import CommonError from '@common/resources/error/error';

@Catch(BadRequestException)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse() as any;

    response.status(CommonError.COMMON_ERROR_0004.statusCode).json({
      statusCode: CommonError.COMMON_ERROR_0004.statusCode,
      errorCode: CommonError.COMMON_ERROR_0004.errorCode,
      message: exceptionResponse.message[0],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
