import { Injectable } from '@nestjs/common';
import { ChapterSettingRequest } from './dtos/chapter-setting.request';
import { ChapterSetting } from './type/type';
import { UserSettingRepository } from './user-setting.repository';

@Injectable()
export class UserSettingService {
  constructor(private readonly userSettingRepository: UserSettingRepository) {}

  async handleUpdateChapterSetting(
    userId: number,
    data: ChapterSettingRequest,
  ): Promise<ChapterSetting> {
    return this.userSettingRepository.updateChapterSetting(userId, data);
  }
}
