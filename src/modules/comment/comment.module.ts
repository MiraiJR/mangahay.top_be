import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { ComicModule } from '../comic/comic.module';
import { UserModule } from '../user/user.module';
import { Answer } from './answer/answer.entity';

@Module({
  imports: [
    ComicModule,
    UserModule,
    JwtModule,
    TypeOrmModule.forFeature([Comment, Answer]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
