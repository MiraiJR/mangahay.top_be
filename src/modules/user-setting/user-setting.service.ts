import { Injectable } from '@nestjs/common';
import { ChapterSettingRequest } from './dtos/chapter-setting.request';
import { UserSettingRepository } from './user-setting.repository';
import { UserSettingResponse } from './user-setting.interface';

@Injectable()
export class UserSettingService {
  constructor(private readonly userSettingRepository: UserSettingRepository) {}

  updateSetting(userId: number, inputData: ChapterSettingRequest): Promise<UserSettingResponse> {
    return this.userSettingRepository.updateSetting(userId, {
      chapter: {
        amount: inputData.chapter.amount,
        type: inputData.chapter.type,
      },
      notification: {
        mention: inputData.notification.mention,
      },
    });
  }
}
