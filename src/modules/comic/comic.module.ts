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

@Module({
  imports: [
    JwtModule,
    ChapterModule,
    CloudinaryModule,
    UserModule,
    NotificationModule,
    TypeOrmModule.forFeature([Comic, Genres]),
  ],
  controllers: [ComicController],
  providers: [ComicService, Logger],
  exports: [ComicService],
})
export class ComicModule {}
