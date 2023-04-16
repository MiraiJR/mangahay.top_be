import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';
import { IdUser } from '../user/decorators/id-user';
import { Response } from 'express';

@Controller('api/notify')
export class NotificationController {
  constructor(private notifyService: NotificationService) {}

  @UseGuards(JwtAuthorizationd)
  @Put('/change-state/:id_notify')
  async changeState(
    @Param('id_notify', new ParseIntPipe()) id_notify: number,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      if (await this.notifyService.checkOwner(id_user, id_notify)) {
        this.notifyService.changeState(id_notify);
      } else {
        throw new ForbiddenException(
          'Bạn không có quyền thực hiện thao tác này!',
        );
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: {},
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: 'Lỗi!',
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/unread-notifies/count')
  async countUnread(@IdUser() id_user: number, @Res() response: Response) {
    try {
      const result = await this.notifyService.countUnread(id_user);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: result,
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: 'Lỗi!',
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Put('/change-state/all/unread')
  async changeStateUnread(
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      console.log(id_user);
      this.notifyService.changeAllStateOfUser(id_user);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: {},
      });
    } catch (error) {
      console.log(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: 'Lỗi!',
      });
    }
  }
}
