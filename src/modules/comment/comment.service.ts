import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AnswerService } from '../answer-comment/answer.service';
import { IAnswer } from '../answer-comment/answer.interface';
import { CommentRepository } from './comment.repository';
import { Comic } from '../comic/comic.entity';

@Injectable()
export class CommentService {
  constructor(private answerService: AnswerService, private commentRepository: CommentRepository) {}

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

  async getCommentsOfComic(comicId: number) {
    return this.commentRepository.findAllDetailCommentsOfComic(comicId);
  }

  async addAnswerToComment(answer: IAnswer) {
    const comment = await this.getCommentById(answer.commentId);

    if (!comment) {
      throw new HttpException('Bình luận không tồn tại!', HttpStatus.NOT_FOUND);
    }

    return this.answerService.createNewAnswerForComment(answer);
  }
}
