import { Module } from '@nestjs/common';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from './comic.entity';
import { ChapterModule } from '../chapter/chapter.module';
import { Genres } from './genre/genre.entity';

@Module({
  imports: [ChapterModule, TypeOrmModule.forFeature([Comic, Genres])],
  controllers: [ComicController],
  providers: [ComicService],
  exports: [ComicService],
})
export class ComicModule {}
