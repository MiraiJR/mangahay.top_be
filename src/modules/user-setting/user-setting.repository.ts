import { Repository } from 'typeorm';
import { UserSettingEntity } from './user-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ChapterSetting } from './type/type';

@Injectable()
export class UserSettingRepository extends Repository<UserSettingEntity> {
  constructor(
    @InjectRepository(UserSettingEntity)
    repository: Repository<UserSettingEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async updateChapterSetting(userId: number, chapterSetting: ChapterSetting) {
    await this.createQueryBuilder()
      .update(UserSettingEntity)
      .set({
        chapterSetting,
      })
      .where('user = :userId', { userId })
      .execute();

    return this.getChapterSettingByUserId(userId);
  }

  async getChapterSettingByUserId(userId: number): Promise<ChapterSetting> {
    const result = await this.createQueryBuilder('user_setting')
      .where('user_setting.user = :userId', { userId })
      .getOne();
    return result.chapterSetting;
  }
}
