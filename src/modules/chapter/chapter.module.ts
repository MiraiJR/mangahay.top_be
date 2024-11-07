import { Logger, Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ChapterController } from './chapter.controller';
import { ChapterRepository } from './chapter.repository';
import { ChapterComicFacade } from './facades/chapter-comic.facade';
import { GoogleApiModule } from '@modules/google-api/google-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter]), JwtModule, UserModule, GoogleApiModule],
  controllers: [ChapterController],
  providers: [ChapterService, Logger, ChapterRepository, ChapterComicFacade],
  exports: [ChapterService, ChapterRepository],
})
export class ChapterModule {}
