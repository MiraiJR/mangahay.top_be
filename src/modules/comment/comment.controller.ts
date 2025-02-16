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
import UserId from '@common/decorators/user-id';
import { AuthGuard } from '@common/guards/auth.guard';
import { CreateCommentRequest } from './dtos/create-comment';
import { ListAnswerRequest } from './dtos/list-answer';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post()
  handlePostComment(
    @Body(new ValidationPipe()) inputData: CreateCommentRequest,
    @UserId()
    userId: number,
  ) {
    return this.commentService.createComment(userId, inputData);
  }

  @Get(':commentId/answers')
  handleGetListAnswerOfComment(
    @Query(new ValidationPipe()) inputQuery: ListAnswerRequest,
    @Param('commentId') commentId: number,
  ) {
    return this.commentService.getListAnswerOfComment(commentId, inputQuery);
  }
}
