import { Body, Controller, Patch, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserSettingService } from './user-setting.service';
import { AuthGuard } from '@common/guards/auth.guard';
import UserId from '../../common/decorators/userId';
import { ChapterSettingRequest } from './dtos/chapter-setting.request';
import { ChapterSetting } from './type/type';

@Controller('api/user-settings')
@UseGuards(AuthGuard)
export class UserSettingController {
  constructor(private readonly userSettingService: UserSettingService) {}

  @Patch('chapter')
  async updateChapterSetting(
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: ChapterSettingRequest,
  ): Promise<ChapterSetting> {
    return this.userSettingService.handleUpdateChapterSetting(userId, data);
  }
}
