import { UserSession } from './user-session.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserSessionRepository extends Repository<UserSession> {
  constructor(
    @InjectRepository(UserSession)
    repository: Repository<UserSession>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  updatePairToken(userId: number, data: PairToken) {
    return this.update(
      {
        userId,
      },
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    );
  }

  findSessionByUserId(userId: number) {
    return this.findOne({
      where: {
        userId,
      },
    });
  }
}
