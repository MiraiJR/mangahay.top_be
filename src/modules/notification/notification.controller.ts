import { Controller, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import UserId from '../user/decorators/userId';

@Controller('api/notifies')
export class NotificationController {
  constructor(private notifyService: NotificationService) {}

  @UseGuards(JwtAuthorizationd)
  @Patch(':notifyId/change-state')
  async handleChangeStateNotify(
    @Param('notifyId', new ParseIntPipe()) notifyId: number,
    @UserId() userId: number,
  ) {
    const notify = await this.notifyService.changeStateNotify(userId, notifyId);

    return notify;
  }
}
