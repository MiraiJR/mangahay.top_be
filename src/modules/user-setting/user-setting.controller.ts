import { Body, Controller, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserSettingService } from './user-setting.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { ChapterSettingRequest } from './dtos/chapter-setting.request';
import UserId from '@common/decorators/user-id';
import { UserSettingResponse } from './user-setting.interface';

@Controller('user-settings')
@UseGuards(AuthGuard)
export class UserSettingController {
  constructor(private readonly userSettingService: UserSettingService) {}

  @Put()
  updateSetting(
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: ChapterSettingRequest,
  ): Promise<UserSettingResponse> {
    return this.userSettingService.updateSetting(userId, data);
  }
}
