import { Injectable } from '@nestjs/common';
import { AnswerRepository } from './answer.repository';
import { IAnswer } from './answer.interface';

@Injectable()
export class AnswerService {
  constructor(private answerRepository: AnswerRepository) {}

  async createNewAnswerForComment(answer: IAnswer) {
    return this.answerRepository.save({
      ...answer,
    });
  }
}
