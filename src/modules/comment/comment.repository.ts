import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Answer } from '../answer-comment/answer.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(
    @InjectRepository(Comment)
    repository: Repository<Comment>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findOneDetailComment(commentId: number) {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.id = :commentId', { commentId })
      .leftJoinAndMapOne('comment.user', User, 'user', 'comment.userId = user.id')
      .select(['comment'])
      .addSelect(['user.id', 'user.fullname', 'user.avatar']);

    const comment = await queryBuilder.getOne();

    return comment;
  }

  async findAllDetailCommentsOfComic(comicId: number) {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.comicId = :comicId', { comicId })
      .leftJoinAndMapOne('comment.user', User, 'user', 'comment.userId = user.id')
      .leftJoinAndMapMany('comment.answers', Answer, 'answer', 'answer.commentId = comment.id')
      .leftJoinAndMapOne('answer.user', User, 'user_answer', 'user_answer.id = answer.userId')
      .select(['comment'])
      .addSelect(['user.id', 'user.fullname', 'user.avatar'])
      .addSelect([
        'answer.id',
        'answer.content',
        'answer.createdAt',
        'answer.updatedAt',
        'answer.mentionedPerson',
      ])
      .addSelect(['user_answer.id', 'user_answer.fullname', 'user_answer.avatar']);

    const comments = await queryBuilder.orderBy('comment.updatedAt', 'DESC').getMany();
    return comments;
  }
}
