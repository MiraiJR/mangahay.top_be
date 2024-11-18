import { forwardRef, Logger, Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { JwtModule } from '@nestjs/jwt';
import { ChapterController } from './chapter.controller';
import { ChapterRepository } from './chapter.repository';
import { ChapterComicFacade } from './facades/chapter-comic.facade';
import { GoogleApiModule } from '@modules/google-api/google-api.module';
import { BullModule } from '@nestjs/bull';
import { QueueName } from '@common/constant/queue-channel';
import { ComicModule } from '@modules/comic/comic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter]),
    JwtModule,
    GoogleApiModule,
    BullModule.registerQueue(
      {
        name: QueueName.NOTIFICAION,
      },
      {
        name: QueueName.COMIC_ELASTICSEARCH_NEW_CHAPTER,
      },
    ),
    forwardRef(() => ComicModule),
  ],
  controllers: [ChapterController],
  providers: [ChapterService, Logger, ChapterRepository, ChapterComicFacade],
  exports: [ChapterService, ChapterRepository],
})
export class ChapterModule {}
