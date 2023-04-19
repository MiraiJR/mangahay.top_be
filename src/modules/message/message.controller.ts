import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { IdUser } from '../user/decorators/id-user';
import { Response } from 'express';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';

@Controller('api/message')
export class MessageController {
  constructor(
    private logger: Logger = new Logger(MessageController.name),
    private messageService: MessageService,
  ) {}

  @UseGuards(JwtAuthorizationd)
  @Get('/conservation')
  async getConservation(@IdUser() id_user: number, @Res() response: Response) {
    try {
      const conservation = await this.messageService.getConservation(id_user);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: conservation,
      });
    } catch (error) {
      this.logger.warn(error);
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'Lỗi!',
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/conservation/:id')
  async getSpecificConservation(
    @IdUser() id_user: number,
    @Param('id', new ParseIntPipe()) object: number,
    @Res() response: Response,
  ) {
    try {
      const specific_conservation =
        await this.messageService.getSpecificConservation(id_user, object);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: specific_conservation,
      });
    } catch (error) {
      this.logger.warn(error);
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'Lỗi!',
      });
    }
  }
}
