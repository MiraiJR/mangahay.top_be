import { Controller, Delete, Param, ParseIntPipe, Patch, Put, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import UserId from '../../common/decorators/userId';

@Controller('api/notifies')
export class NotificationController {
  constructor(private notifyService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Patch(':notifyId/change-state')
  async handleChangeStateNotify(
    @Param('notifyId', new ParseIntPipe()) notifyId: number,
    @UserId() userId: number,
  ) {
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
