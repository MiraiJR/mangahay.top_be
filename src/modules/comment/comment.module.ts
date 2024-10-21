import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { UserModule } from '../user/user.module';
import { CommentRepository } from './comment.repository';
import { CommentController } from './comment.controller';
import { MentionedUserRepository } from './mentioned-user/mentioned-user.repository';
import { MentionedUser } from './mentioned-user/mentioned-user.entity';

@Module({
  imports: [UserModule, JwtModule, TypeOrmModule.forFeature([CommentEntity, MentionedUser])],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, MentionedUserRepository],
  exports: [CommentService, CommentRepository, MentionedUserRepository],
})
export class CommentModule {}
