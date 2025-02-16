import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentRequest } from './dtos/create-comment';
import { DataSource } from 'typeorm';
import { ListAnswerRequest } from './dtos/list-answer';
import { MentionedUserRepository } from './mentioned-user/mentioned-user.repository';
import { CommentNotificationFacade } from './facade/comment-notification.facade';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly mentionedUserRepository: MentionedUserRepository,
    private readonly databaseConnection: DataSource,
    private readonly commentNotificationFacade: CommentNotificationFacade,
  ) {}

  async getCommentById(commentId: number) {
    return this.commentRepository.findOneDetailComment(commentId);
  }

  createComment(userId: number, inputData: CreateCommentRequest) {
    return this.databaseConnection.transaction(async (manager) => {
      const newComment = await this.commentRepository.createRecord(
        {
          userId,
          comicId: inputData.comicId,
          content: inputData.content,
          parentCommentId: inputData.targetCommentId ?? null,
        },
        manager,
      );

      const { mentionedUserIds } = inputData;

      if (mentionedUserIds && mentionedUserIds.length > 0) {
        for (const mentionedUserId of mentionedUserIds) {
          await this.mentionedUserRepository.createRecord(
            {
              commentId: newComment.id,
              mentionedUserId: mentionedUserId,
            },
            manager,
          );
        }
      }

      await this.commentNotificationFacade.notifyToListMentionedUser(userId, mentionedUserIds, {
        content: inputData.content,
      });

      return this.getCommentById(newComment.id);
    });
  }

  async getListAnswerOfComment(commentId: number, inputQuery: ListAnswerRequest) {
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
