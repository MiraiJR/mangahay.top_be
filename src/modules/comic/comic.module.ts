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
import { HttpModule } from '@nestjs/axios';
import { GoogleApiModule } from '../google-api/google-api.module';
import { CrawlerService } from './crawler.service';
import { BullModule } from '@nestjs/bull';
import { CrawlChaptersProcessor } from './comic.prossessor';
import { ExternalServiceModule } from '@common/external-service/external-service.module';
import { ElasticsearchAdapterModule } from '@common/external-service/elasticsearch/elasticsearch.module';
import { SearchComicController } from './search-comic/search-comic.controller';
import { SearchComicService } from './search-comic/search-comic.service';
import { ComicInteractionRepository } from './comic-interaction/comicInteraction.repository';
import { ComicInteractionService } from './comic-interaction/comicInteraction.service';
import { ComicInteraction } from './comic-interaction/comicInteraction.entity';

@Module({
  imports: [
    GoogleApiModule,
    JwtModule,
    ChapterModule,
    NotificationModule,
    CommentModule,
    HttpModule,
    TypeOrmModule.forFeature([Comic, ComicInteraction]),
    BullModule.registerQueue({
      name: 'crawl-chapters',
    }),
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
    CrawlerService,
    CrawlChaptersProcessor,
    SearchComicService,
    ComicInteractionRepository,
    ComicInteractionService,
  ],
  exports: [ComicService, ComicInteractionRepository, ComicInteractionService],
})
export class ComicModule {}
