import { Logger, Module } from '@nestjs/common';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from './comic.entity';
import { ChapterModule } from '../chapter/chapter.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ComicResolver } from './comic.resolver';
import { ComicRepository } from './comic.repository';
import { CommentModule } from '../comment/comment.module';
import { GoogleApiModule } from '../google-api/google-api.module';
import { BullModule } from '@nestjs/bull';
import { CrawlChaptersProcessor } from './comic.prossessor';
import { ExternalServiceModule } from '@common/external-service/external-service.module';
import { ElasticsearchAdapterModule } from '@common/external-service/elasticsearch/elasticsearch.module';
import { SearchComicController } from './search-comic/search-comic.controller';
import { SearchComicService } from './search-comic/search-comic.service';
import { ComicInteractionRepository } from './comic-interaction/comicInteraction.repository';
import { ComicInteractionService } from './comic-interaction/comicInteraction.service';
import { ComicInteraction } from './comic-interaction/comicInteraction.entity';
import { UpdateComicAfterCreatingNewChapterConsumer } from './elasticsearch/update-after-creating-new-chapter.consumer';
import { QueueName } from '@common/constant/queue-channel';

@Module({
  imports: [
    GoogleApiModule,
    JwtModule,
    ChapterModule,
    NotificationModule,
    CommentModule,
    TypeOrmModule.forFeature([Comic, ComicInteraction]),
    BullModule.registerQueue(
      {
        name: 'crawl-chapters',
      },
      {
        name: QueueName.COMIC_ELASTICSEARCH_NEW_CHAPTER,
      },
    ),
    ExternalServiceModule,
    ElasticsearchAdapterModule,
    UserModule,
  ],
  controllers: [ComicController, SearchComicController],
  providers: [
    ComicService,
    Logger,
    ComicResolver,
    ComicRepository,
    CrawlChaptersProcessor,
    SearchComicService,
    ComicInteractionRepository,
    ComicInteractionService,
    UpdateComicAfterCreatingNewChapterConsumer,
  ],
  exports: [ComicService, ComicInteractionRepository, ComicInteractionService],
})
export class ComicModule {}
