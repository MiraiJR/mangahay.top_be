import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSocialEntity } from './user-social.entity';
import { ProviderType } from './social.enum';

@Injectable()
export class UserSocialRepository extends Repository<UserSocialEntity> {
  constructor(
    @InjectRepository(UserSocialEntity)
    repository: Repository<UserSocialEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findBySocialIdAndType(providerId: string, providerType: ProviderType) {
    return this.findOne({
      where: {
        providerId,
        providerType,
      },
    });
  }
}
