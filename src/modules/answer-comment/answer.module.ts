import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerRepository } from './answer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer])],
  controllers: [],
  providers: [AnswerService, AnswerRepository],
  exports: [AnswerService],
})
export class AnswerModule {}
