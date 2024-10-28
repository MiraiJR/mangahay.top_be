import { Injectable } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { User } from '../user/user.entity';
import { Equal, IsNull, LessThan, Repository } from 'typeorm';
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

  async getCommentParentsByComicId(
    comicId: number,
    page: number,
    size: number,
  ): Promise<UserComment[]> {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.comicId = :comicId', { comicId })
      .andWhere('comment.parentCommentId IS NULL')
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
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(child.id)', 'theNumberOfAnswer')
            .from(CommentEntity, 'child')
            .where('child.parentCommentId = comment.id'),
        'comment_theNumberOfAnswer',
      )
      .orderBy('comment.updatedAt', 'DESC')
      .offset((page - 1) * size)
      .limit(size);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    entities.forEach((comment, index) => {
      comment['theNumberOfAnswer'] = parseInt(raw[index]['comment_theNumberOfAnswer'], 10) || 0;
    });

    return this.convertToUserComment(entities);
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
        theNumberOfAnswer: comment['theNumberOfAnswer'],
      });
    });

    return result;
  }

  async getListAnswerOfComment(commentId: number, limit: number, lastAnswerId?: number) {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.parentCommentId = :commentId', { commentId })
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
      .orderBy('comment.updatedAt', 'DESC')
      .limit(limit);

    if (lastAnswerId) {
      queryBuilder.andWhere('comment.id < :lastAnswerId', { lastAnswerId });
    }

    const comments = await queryBuilder.getMany();

    return this.convertToUserComment(comments);
  }

  countAnswerOfComment(commentId: number) {
    return this.count({
      where: {
        parentCommentId: commentId,
      },
    });
  }

  countCommentParentOfComic(comicId: number) {
    return this.count({
      where: {
        comicId,
        parentCommentId: IsNull(),
      },
    });
  }

  countAnswersBefore(commentId: number, lastAnswerId: number) {
    return this.count({
      where: {
        parentCommentId: commentId,
        id: LessThan(lastAnswerId),
      },
    });
  }

  countCommentsBefore(lastCommentId: number) {
    return this.count({
      where: {
        id: LessThan(lastCommentId),
        parentCommentId: IsNull(),
      },
    });
  }
}
