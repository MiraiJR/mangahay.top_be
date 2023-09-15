import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { IComment } from './comment.interface';
import { User } from '../user/user.entity';
import { AnswerService } from '../answer-comment/answer.service';
import { Answer } from '../answer-comment/answer.entity';
import { IAnswer } from '../answer-comment/answer.interface';
import { CommentRepository } from './comment.repository';

@Injectable()
export class CommentService {
  constructor(private answerService: AnswerService, private commentRepository: CommentRepository) {}

  async getCommentById(commentId: number) {
    return this.commentRepository.findOneDetailComment(commentId);
  }

  async createNewComment(comment: IComment) {
    const newComment = await this.commentRepository.save({ ...comment });
    const newDetailComment = await this.getCommentById(newComment.id);

    return newDetailComment;
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
