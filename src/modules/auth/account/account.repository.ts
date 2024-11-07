import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountEntity } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from '@common/utils/password.util';

@Injectable()
export class AccountRepository extends Repository<AccountEntity> {
  constructor(
    @InjectRepository(AccountEntity)
    repository: Repository<AccountEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findByEmail(email: string) {
    return this.findOne({
      where: {
        email,
      },
    });
  }

  async updatePassword(email: string, newRawPassword: string) {
    return this.createQueryBuilder()
      .update(AccountEntity)
      .set({ password: await hashPassword(newRawPassword) })
      .where('email = :email', { email })
      .execute();
  }
}
