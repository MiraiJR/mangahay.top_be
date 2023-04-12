import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IComment } from './comment.interface';
import { Answer } from './answer/answer.entity';
import { IAnswer } from './answer/answer.interface';
import { User } from '../user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async create(comment: IComment) {
    return await this.commentRepository.save(comment);
  }

  async edit(id_comment: any, content: any) {
    return await this.commentRepository.save({
      id: id_comment,
      content,
    });
  }

  async delete(id_comment: any) {
    return await this.commentRepository.delete({ id: id_comment });
  }

  async getCommentOfComic(id_comic: any) {
    return await this.commentRepository
      .createQueryBuilder('comments')
      .leftJoin('comments.id_user', 'users')
      .addSelect(['users.fullname' as 'fullname'])
      .addSelect(['users.avatar' as 'avatar'])
      .leftJoinAndMapMany(
        'comments.answer',
        Answer,
        'answers',
        'comments.id = answers.id_comment',
      )
      .leftJoinAndMapOne(
        'answers.id_user',
        User,
        'user',
        'answers.id_user = user.id',
      )
      .where('comments.id_comic = :id_comic', { id_comic: parseInt(id_comic) })
      .orderBy('comments.createdAt', 'DESC')
      .addOrderBy('comments.updatedAt', 'DESC')
      .addOrderBy('answers.createdAt', 'ASC')
      .getMany();
  }

  async addAnswerToComment(answer: IAnswer) {
    return this.answerRepository.save({
      ...answer,
    });
  }
}
