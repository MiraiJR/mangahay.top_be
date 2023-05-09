import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Response } from 'express';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';
import { IdUser } from '../user/decorators/id-user';

@Controller('api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @UseGuards(JwtAuthorizationd)
  @Post(':id_comic')
  async createNewComment(
    @Param('id_comic') id_comic: any,
    @Res() response: Response,
    @IdUser() id_user: number,
    @Body('content') content: any,
  ) {
    try {
      const new_comment = await this.commentService.create({
        content,
        id_user,
        id_comic,
      });

      return response.status(HttpStatus.OK).json({
        statusCode: 200,
        success: true,
        message: 'get all comic successfully!',
        result: new_comment,
      });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get(':id_comic/comments')
  async getCommentOfComic(
    @Param('id_comic') id_comic: any,
    @Res() response: Response,
  ) {
    try {
      const comments = await this.commentService.getCommentOfComic(id_comic);

      return response.status(HttpStatus.OK).json({
        statusCode: 200,
        success: true,
        message: 'get all comic successfully!',
        result: comments,
      });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Post('answer/:id_comment')
  async answerCommnet(
    @Param('id_comment') id_comment: any,
    @Body() answer: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      const new_answer = this.commentService.addAnswerToComment({
        ...answer,
        id_comment,
        id_user,
      });

      return response.status(HttpStatus.OK).json({
        statusCode: 200,
        success: true,
        message: 'get all comic successfully!',
        result: new_answer,
      });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  // top người dùng tương tác website nhiều nhất
  @Get('analysis/the-most-interactive-user')
  async theMostInteractiveUser(@Query() query: any, @Res() response: Response) {
    try {
      const result = await this.commentService.topTheInteractiveUser(query);

      return response.status(HttpStatus.OK).json({
        statusCode: 200,
        success: true,
        message: 'Thao tác thành công!',
        result: result,
      });
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }
}
