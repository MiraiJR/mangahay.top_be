import { Logger, Module } from '@nestjs/common';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from './comic.entity';
import { ChapterModule } from '../chapter/chapter.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ComicResolver } from './comic.resolver';
import { RedisModule } from '../redis/redis.module';
import { ComicRepository } from './comic.repository';
import { ComicInteractionModule } from '../comic-interaction/comicInteraction.module';
import { CommentModule } from '../comment/comment.module';
import { HttpModule } from '@nestjs/axios';
import { GoogleApiModule } from '../google-api/google-api.module';
import { CoreModule } from 'src/core/core.module';
import { CrawlerService } from './crawler.service';
import { BullModule } from '@nestjs/bull';
import { CrawlChaptersProcessor } from './comic.prossessor';
import { S3Module } from '../image-storage/s3.module';

@Module({
  imports: [
    GoogleApiModule,
    JwtModule,
    ChapterModule,
    CloudinaryModule,
    UserModule,
    NotificationModule,
    ComicInteractionModule,
    RedisModule,
    CommentModule,
    HttpModule,
    TypeOrmModule.forFeature([Comic]),
    CoreModule,
    BullModule.registerQueue({
      name: 'crawl-chapters',
    }),
    S3Module,
  ],
  controllers: [ComicController],
  providers: [
    ComicService,
    Logger,
    ComicResolver,
    ComicRepository,
    CrawlerService,
    CrawlChaptersProcessor,
  ],
  exports: [ComicService],
})
export class ComicModule {}
