import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { Comic } from '../comic/comic.entity';
import { CommandCommentRequest } from './models/requests/command-comment.request';
import { CommentEntity } from './comment.entity';
import { MentionedUserRepository } from './mentioned-user/mentioned-user.repository';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly mentionedUserRepository: MentionedUserRepository,
  ) {}

  async getCommentById(commentId: number) {
    return this.commentRepository.findOneDetailComment(commentId);
  }

  async createNewComment(userId: number, comic: Comic, content: string) {
    const newComment = await this.commentRepository
      .getRepository()
      .save({ userId, comic, content });
    const newDetailComment = await this.getCommentById(newComment.id);

    return {
      ...newDetailComment,
      answers: [],
    };
  }

  async createComment(userId: number, inputData: CommandCommentRequest) {
    const newComment = await this.commentRepository.getRepository().save({
      userId,
      comicId: inputData.comicId,
      content: inputData.content,
      parentCommentId: inputData.targetCommentId ?? null,
    });

    if (inputData.mentionedUserId) {
      await this.mentionedUserRepository.getRepository().save({
        commentId: newComment.id,
        mentionedUserId: inputData.mentionedUserId,
      });
    }

    return newComment;
  }

  async getCommentsOfComic(comicId: number): Promise<UserCommentResponse[]> {
    const listCommentIncludingAnswer = await this.commentRepository.getCommentsByComicId(comicId);
    const commentMap: Map<number, UserCommentResponse> = new Map();
    const commentTree: Map<number, UserCommentResponse> = new Map();
    listCommentIncludingAnswer.forEach((comment) => {
      if (!comment.answers) {
        comment.answers = [];
      }

      commentMap.set(comment.id, comment);
    });

    listCommentIncludingAnswer.forEach((comment) => {
      if (!comment.parentCommentId) {
        commentTree.set(comment.id, comment);
        return;
      }

      const parentComment = commentMap.get(comment.parentCommentId);
      if (parentComment) {
        parentComment.answers.push(comment);
      }
    });

    return Array.from(commentTree.values());
  }
}
