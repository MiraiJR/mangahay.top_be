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

  async getOneComment(id_comment: number) {
    return await this.commentRepository.manager.query(`
      select cmt.id, cmt.id_comic, cmt."id_user", cmt.content, cmt."createdAt", cmt."updatedAt", u.fullname
      from public.comment cmt join public.user u on cmt.id_user = u.id
      where cmt.id = ${id_comment}
    `);
  }

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

  async topTheInteractiveUser(query: any) {
    return await this.commentRepository.manager.query(
      `select "id_user", u.fullname, count(cmt.id)
      from public."comment" as cmt join public."user" as u on cmt."id_user" = u.id
      group by "id_user", u.fullname
      limit ${query.limit}`,
    );
  }
}
