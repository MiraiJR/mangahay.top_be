import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AnswerRepository extends Repository<Answer> {
  constructor(
    @InjectRepository(Answer)
    repository: Repository<Answer>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
