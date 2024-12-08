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
import { ChapterImageEntity } from './chapter-image/chapter-image.entity';
import { ChapterImageRepository } from './chapter-image/chapter-image.repository';
import { ChapterUtilService } from './util/chapter.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter, ChapterImageEntity]),
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
  providers: [
    ChapterService,
    Logger,
    ChapterRepository,
    ChapterComicFacade,
    ChapterImageRepository,
    ChapterUtilService,
  ],
  exports: [ChapterService, ChapterRepository, ChapterImageRepository, ChapterUtilService],
})
export class ChapterModule {}
