import { Repository } from 'typeorm';
import { UserSettingEntity } from './user-setting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSettingRepository extends Repository<UserSettingEntity> {
  constructor(
    @InjectRepository(UserSettingEntity)
    repository: Repository<UserSettingEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
