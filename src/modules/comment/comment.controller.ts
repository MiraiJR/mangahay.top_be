import { Body, Controller, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import UserId from '@common/decorators/userId';
import { AuthGuard } from '@common/guards/auth.guard';
import { CommandCommentRequest } from './models/requests/command-comment.request';

@Controller('api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Post()
  async handlePostComment(
    @Body(new ValidationPipe()) inputData: CommandCommentRequest,
    @UserId()
    userId: number,
  ) {
    return this.commentService.createComment(userId, inputData);
  }
}
