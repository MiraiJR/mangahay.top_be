import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { UserModule } from '../user/user.module';
import { AnswerModule } from '../answer-comment/answer.module';
import { CommentRepository } from './comment.repository';

@Module({
  imports: [UserModule, JwtModule, AnswerModule, TypeOrmModule.forFeature([Comment])],
  controllers: [],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
