import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { Comic } from '../comic/comic.entity';
import { CommandCommentRequest } from './models/requests/command-comment.request';
import { CommentEntity } from './comment.entity';
import { DataSource } from 'typeorm';
import { MentionedUser } from './mentioned-user/mentioned-user.entity';
import { ListAnswerQuery } from './models/requests/list-answer.query';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly databaseConnection: DataSource,
  ) {}

  async getCommentById(commentId: number) {
    return this.commentRepository.findOneDetailComment(commentId);
  }

  async createNewComment(userId: number, comic: Comic, content: string) {
    const newComment = await this.commentRepository.save({ userId, comic, content });
    const newDetailComment = await this.getCommentById(newComment.id);

    return {
      ...newDetailComment,
      answers: [],
    };
  }

  createComment(userId: number, inputData: CommandCommentRequest) {
    return this.databaseConnection.transaction(async (manager) => {
      const newComment = await manager.getRepository(CommentEntity).save({
        userId,
        comicId: inputData.comicId,
        content: inputData.content,
        parentCommentId: inputData.targetCommentId ?? null,
      });

      if (inputData.mentionedUserId && inputData.mentionedUserId !== userId) {
        await manager.getRepository(MentionedUser).save({
          commentId: newComment.id,
          mentionedUserId: inputData.mentionedUserId,
        });
      }

      return newComment;
    });
  }

  async getListAnswerOfComment(commentId: number, inputQuery: ListAnswerQuery) {
    const { lastAnswerId, limit } = inputQuery;
    const answers = await this.commentRepository.getListAnswerOfComment(
      commentId,
      limit,
      lastAnswerId,
    );

    let hasPrevious = false;

    if (lastAnswerId) {
      const totalAnswerBeforeLast = await this.commentRepository.countAnswersBefore(
        commentId,
        lastAnswerId,
      );
      hasPrevious = totalAnswerBeforeLast > limit;
    } else {
      const totalAnswer = await this.commentRepository.countAnswerOfComment(commentId);
      hasPrevious = totalAnswer > limit;
    }

    return {
      answers,
      hasPrevious,
    };
  }
}
