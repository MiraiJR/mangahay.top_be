import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import UserId from '../../common/decorators/userId';
import { toNotificationType } from '@modules/user/types/NotificationType';

@Controller('api/notifies')
export class NotificationController {
  constructor(private notifyService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getNotifies(@Query('type') type: string = '2', @UserId() userId: number) {
    const notifies = await this.notifyService.getNotifiesOfUser(userId, toNotificationType(type));

    return notifies;
  }

  @UseGuards(AuthGuard)
  @Patch(':notifyId/change-state')
  async handleChangeStateNotify(
    @Param('notifyId', new ParseIntPipe()) notifyId: number,
    @UserId() userId: number,
  ): Promise<
    {
      isRead: true;
      id: number;
      userId: number;
      user: import('d:/Personal_Project/mangahay/back-end/src/modules/user/user.entity').User;
      title: string;
      body: string;
      redirectUrl: string;
      thumb: string;
      createdAt: Date;
      updatedAt: Date;
    } & import('d:/Personal_Project/mangahay/back-end/src/modules/notification/notification.entity').Notification
  > {
    const notify = await this.notifyService.changeStateNotify(userId, notifyId);

    return notify;
  }

  @UseGuards(AuthGuard)
  @Put('/mark-all-read')
  async handleMarkAllRead(@UserId() userId: number) {
    await this.notifyService.changeAllStateOfUser(userId, true);

    return 'Mark read all notifications successfully!';
  }

  @UseGuards(AuthGuard)
  @Delete()
  async handleRemoveAll(@UserId() userId: number) {
    await this.notifyService.removeAllNotificationsOfUser(userId);

    return 'Removed all notifications successfully!';
  }
}
