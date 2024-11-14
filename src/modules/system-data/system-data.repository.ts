import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemDataEntity } from './system-data.entity';

@Injectable()
export class SystemDataRepository extends Repository<SystemDataEntity> {
  constructor(
    @InjectRepository(SystemDataEntity)
    repository: Repository<SystemDataEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getValueByKey(key: string) {
    return this.findOne({
      where: {
        key,
      },
    });
  }

  updateValueByKey(key: string, newValue: any) {
    return this.update(
      {
        key,
      },
      {
        value: newValue,
      },
    );
  }
}
