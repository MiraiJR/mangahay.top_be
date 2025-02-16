import { Repository } from 'typeorm';
import { UserSettingEntity } from './user-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { UpdateUserSetting } from './user-setting.interface';

@Injectable()
export class UserSettingRepository extends Repository<UserSettingEntity> {
  constructor(
    @InjectRepository(UserSettingEntity)
    repository: Repository<UserSettingEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async updateSetting(userId: number, setting: UpdateUserSetting) {
    await this.createQueryBuilder()
      .update(UserSettingEntity)
      .set({
        chapter: {
          ...setting.chapter,
        },
        notification: {
          ...setting.notification,
        },
      })
      .where('user = :userId', { userId })
      .execute();

    return this.getSettingByUserId(userId);
  }

  async getSettingByUserId(userId: number) {
    const result = await this.createQueryBuilder('user_setting')
      .where('user_setting.user = :userId', { userId })
      .getOne();

    return {
      chapter: { ...result.chapter },
      notification: {
        ...result.notification,
      },
    };
  }

  async getNotificationSetting(userId: number) {
    const { notification } = await this.getSettingByUserId(userId);
    return notification;
  }
}
