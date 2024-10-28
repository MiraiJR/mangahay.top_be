import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import UserId from '@common/decorators/userId';
import { AuthGuard } from '@common/guards/auth.guard';
import { CommandCommentRequest } from './models/requests/command-comment.request';
import { ListAnswerQuery } from './models/requests/list-answer.query';

@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post()
  handlePostComment(
    @Body(new ValidationPipe()) inputData: CommandCommentRequest,
    @UserId()
    userId: number,
  ) {
    return this.commentService.createComment(userId, inputData);
  }

  @Get(':commentId/answers')
  handleGetListAnswerOfComment(
    @Query(new ValidationPipe()) inputQuery: ListAnswerQuery,
    @Param('commentId') commentId: number,
  ) {
    return this.commentService.getListAnswerOfComment(commentId, inputQuery);
  }
}
