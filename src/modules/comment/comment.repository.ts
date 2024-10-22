import { Injectable } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
  constructor(
    @InjectRepository(CommentEntity)
    repository: Repository<CommentEntity>,
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

  async getCommentsByComicId(comicId: number): Promise<UserComment[]> {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.comicId = :comicId', { comicId })
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.mentionedUser', 'mentionedUser')
      .leftJoinAndSelect('mentionedUser.mentionedUser', 'mentionedUserDetails')
      .select([
        'comment',
        'user.id',
        'user.fullname',
        'user.avatar',
        'mentionedUser',
        'mentionedUserDetails.id',
        'mentionedUserDetails.fullname',
      ])
      .orderBy('comment.updatedAt', 'ASC');

    const comments = await queryBuilder.getMany();
    return this.convertToUserComment(comments);
  }

  private convertToUserComment(comments: CommentEntity[]): UserComment[] {
    const result = [];

    comments.map((comment) => {
      result.push({
        id: comment.id,
        parentCommentId: comment.parentCommentId,
        comicId: comment.comicId,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.createdAt,
        user: comment.user,
        mentionedUser: comment.mentionedUser?.mentionedUser ?? null,
      });
    });

    return result;
  }
}
