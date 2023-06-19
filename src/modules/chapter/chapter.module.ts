import { Logger, Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter])],
  controllers: [ChapterController],
  providers: [ChapterService, Logger],
  exports: [ChapterService],
})
export class ChapterModule {}
