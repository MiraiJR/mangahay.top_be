import { EntityManager, Repository } from 'typeorm';
import { MentionedUser } from './mentioned-user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateMentionUser } from './interface';

@Injectable()
export class MentionedUserRepository extends Repository<MentionedUser> {
  constructor(
    @InjectRepository(MentionedUser)
    repository: Repository<MentionedUser>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  createRecord(data: ICreateMentionUser, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(MentionedUser) : this;

    return repository.save({
      ...data,
    });
  }
}
