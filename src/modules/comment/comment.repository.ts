import { Inject, Injectable, Scope } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { User } from '../user/user.entity';
import { BaseRepository } from '@common/database/base.repository';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class CommentRepository extends BaseRepository<CommentEntity> {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  protected getEntityClass(): new () => CommentEntity {
    return CommentEntity;
  }

  async findOneDetailComment(commentId: number) {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('comment')
      .where('comment.id = :commentId', { commentId })
      .leftJoinAndMapOne('comment.user', User, 'user', 'comment.userId = user.id')
      .select(['comment'])
      .addSelect(['user.id', 'user.fullname', 'user.avatar']);

    const comment = await queryBuilder.getOne();

    return comment;
  }

  async getCommentsByComicId(comicId: number): Promise<UserComment[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('comment')
      .where('comment.comicId = :comicId', { comicId })
      .leftJoinAndSelect('comment.user', 'user') // Join the user who made the comment
      .leftJoinAndSelect('comment.mentionedUser', 'mentionedUser') // Assuming you have a collection of mentioned users
      .leftJoinAndSelect('mentionedUser.mentionedUser', 'mentionedUserDetails') // Join the user details of the mentioned users
      .select([
        'comment',
        'user.id',
        'user.fullname',
        'user.avatar',
        'mentionedUser',
        'mentionedUserDetails.id',
        'mentionedUserDetails.fullname',
      ])
      .orderBy('comment.updatedAt', 'DESC');

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
