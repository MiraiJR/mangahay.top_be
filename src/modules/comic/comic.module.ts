import { Logger, Module } from '@nestjs/common';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from './comic.entity';
import { ChapterModule } from '../chapter/chapter.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ComicRepository } from './comic.repository';
import { CommentModule } from '../comment/comment.module';
import { GoogleApiModule } from '../../common/external-service/google-api/google-api.module';
import { BullModule } from '@nestjs/bull';
import { CrawlChaptersProcessor } from './comic.prossessor';
import { ExternalServiceModule } from '@common/external-service/external-service.module';
import { ElasticsearchAdapterModule } from '@common/external-service/elasticsearch/elasticsearch.module';
import { SearchComicController } from './search-comic/search-comic.controller';
import { SearchComicService } from './search-comic/search-comic.service';
import { ComicInteractionRepository } from './comic-interaction/comic-interaction.repository';
import { ComicInteractionService } from './comic-interaction/comic-interaction.service';
import { ComicInteraction } from './comic-interaction/comic-interaction.entity';
import { UpdateComicAfterCreatingNewChapterConsumer } from './elasticsearch/consumer/update-after-interacting-with-chapter.consumer';
import { QueueName } from '@common/constant/queue-channel';
import { ComicPrivilegeEntity } from './comic-privilege/comic-privilege.entity';
import { ComicPrivilegeRepository } from './comic-privilege/comic-privilege.repository';
import { ComicNotificationService } from './notification/comic.notifcation';
import { ComicPrivilegeService } from './comic-privilege/comic-privilege.service';
import { ComicPrivilegeController } from './comic-privilege/comic-privilege.controller';
import { ComicUtilService } from './shared/comic.util';
import { ReindexComicService } from './elasticsearch/services/reindex-comic.service';

@Module({
  imports: [
    GoogleApiModule,
    JwtModule,
    ChapterModule,
    NotificationModule,
    CommentModule,
    TypeOrmModule.forFeature([Comic, ComicInteraction, ComicPrivilegeEntity]),
    BullModule.registerQueue(
      {
        name: 'crawl-chapters',
      },
      {
        name: QueueName.COMIC_ELASTICSEARCH_NEW_CHAPTER,
      },
      {
        name: QueueName.NOTIFICAION,
      },
    ),
    ExternalServiceModule,
    ElasticsearchAdapterModule,
    UserModule,
  ],
  controllers: [ComicController, SearchComicController, ComicPrivilegeController],
  providers: [
    ComicService,
    Logger,
    ComicRepository,
    CrawlChaptersProcessor,
    SearchComicService,
    ComicInteractionRepository,
    ComicInteractionService,
    UpdateComicAfterCreatingNewChapterConsumer,
    ComicPrivilegeRepository,
    ComicNotificationService,
    ComicPrivilegeService,
    ComicUtilService,
    ReindexComicService,
  ],
  exports: [
    ComicService,
    ComicInteractionRepository,
    ComicInteractionService,
    ComicPrivilegeRepository,
    ComicRepository,
    ComicUtilService,
    ReindexComicService,
  ],
})
export class ComicModule {}
