import { Injectable } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { User } from '../user/user.entity';
import { EntityManager, IsNull, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IPagination } from '@common/interfaces/pagination';

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
  constructor(
    @InjectRepository(CommentEntity)
    repository: Repository<CommentEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  createRecord(data: ICreateComment, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(CommentEntity) : this;

    return repository.save({
      ...data,
    });
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

  async getCommentParentsByComicId(comicId: number, paging?: IPagination): Promise<UserComment[]> {
    let queryBuilder = this.createQueryBuilder('comment')
      .distinctOn(['comment.id'])
      .where('comment.comicId = :comicId', { comicId })
      .andWhere('comment.parentCommentId IS NULL')
      .leftJoinAndMapOne('comment.user', 'comment.user', 'user')
      .leftJoinAndMapMany('comment.mentionedUsers', 'comment.mentionedUsers', 'mentionedUsers')
      .leftJoinAndMapOne(
        'mentionedUsers.mentionedUser',
        'mentionedUsers.mentionedUser',
        'mentionedUserDetail',
      )
      .select([
        'comment',
        'user.id',
        'user.fullname',
        'user.avatar',
        'mentionedUsers.id',
        'mentionedUserDetail.id',
        'mentionedUserDetail.fullname',
        'mentionedUserDetail.avatar',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(answer.id)', 'theNumberOfAnswer')
            .from(CommentEntity, 'answer')
            .where('answer.parentCommentId = comment.id'),
        'comment_theNumberOfAnswer',
      )
      .orderBy('comment.id', 'DESC')
      .addOrderBy('comment.updatedAt', 'DESC');

    if (paging) {
      const { page, size } = paging;

      queryBuilder = queryBuilder.offset((page - 1) * size).limit(size);
    }

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    entities.forEach((comment) => {
      const commentRawRecord = raw.find((record) => record['comment_id'] === comment.id);
      comment['theNumberOfAnswer'] =
        parseInt(commentRawRecord['comment_theNumberOfAnswer'], 10) || 0;
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
        mentionedUsers: comment.mentionedUsers.map((mentionedUser) => mentionedUser.mentionedUser),
        theNumberOfAnswer: comment['theNumberOfAnswer'] ?? 0,
      });
    });

    return result;
  }

  async getListAnswerOfComment(commentId: number, limit: number, lastAnswerId?: number) {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.parentCommentId = :commentId', { commentId })
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndMapMany('comment.mentionedUsers', 'comment.mentionedUsers', 'mentionedUsers')
      .leftJoinAndSelect('mentionedUsers.mentionedUser', 'mentionedUserDetail')
      .select([
        'comment',
        'user.id',
        'user.fullname',
        'user.avatar',
        'mentionedUsers.id',
        'mentionedUserDetail.id',
        'mentionedUserDetail.fullname',
        'mentionedUserDetail.avatar',
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
