import { Logger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';
import { UserResolver } from './user.resolver';
import { ComicModule } from '../comic/comic.module';
import { Comic } from '../comic/comic.entity';
import { Genres } from '../comic/genre/genre.entity';
import { ChapterModule } from '../chapter/chapter.module';
import { ComicInteractionModule } from '../comic-interaction/comicInteraction.module';
import { ReadingHistoryModule } from '../reading-history/readingHistory.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    CloudinaryModule,
    JwtModule,
    NotificationModule,
    ComicInteractionModule,
    ReadingHistoryModule,
    RedisModule,
    forwardRef(() => ComicModule),
    TypeOrmModule.forFeature([User, Comic, Genres]),
  ],
  controllers: [UserController],
  providers: [UserService, UserResolver, Logger],
  exports: [UserService],
})
export class UserModule {}
