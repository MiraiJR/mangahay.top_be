import { Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MentionedUser } from './mentioned-user.entity';
import { BaseRepository } from '@common/database/base.repository';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class MentionedUserRepository extends BaseRepository<MentionedUser> {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  protected getEntityClass(): new () => MentionedUser {
    return MentionedUser;
  }
}
