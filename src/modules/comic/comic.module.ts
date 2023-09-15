import { Logger, Module } from '@nestjs/common';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from './comic.entity';
import { ChapterModule } from '../chapter/chapter.module';
import { Genres } from './genre/genre.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ComicResolver } from './comic.resolver';
import { RedisModule } from '../redis/redis.module';
import { ComicRepository } from './comic.repository';
import { ComicInteractionModule } from '../comic-interaction/comicInteraction.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  imports: [
    JwtModule,
    ChapterModule,
    CloudinaryModule,
    UserModule,
    NotificationModule,
    ComicInteractionModule,
    RedisModule,
    CommentModule,
    TypeOrmModule.forFeature([Comic, Genres]),
  ],
  controllers: [ComicController],
  providers: [ComicService, Logger, ComicResolver, ComicRepository],
  exports: [ComicService],
})
export class ComicModule {}
