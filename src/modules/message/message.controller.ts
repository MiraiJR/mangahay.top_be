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
import { Response } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import UserId from '../../common/decorators/userId';

@Controller('api/message')
export class MessageController {
  constructor(
    private logger: Logger = new Logger(MessageController.name),
    private messageService: MessageService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/conservation')
  async getConservation(@UserId() id_user: number, @Res() response: Response) {
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

  @UseGuards(AuthGuard)
  @Get('/conservation/:id')
  async getSpecificConservation(
    @UserId() id_user: number,
    @Param('id', new ParseIntPipe()) object: number,
    @Res() response: Response,
  ) {
    try {
      const specific_conservation = await this.messageService.getSpecificConservation(
        id_user,
        object,
      );

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
