import { Repository } from 'typeorm';
import { MentionedUser } from './mentioned-user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MentionedUserRepository extends Repository<MentionedUser> {
  constructor(
    @InjectRepository(MentionedUser)
    repository: Repository<MentionedUser>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
