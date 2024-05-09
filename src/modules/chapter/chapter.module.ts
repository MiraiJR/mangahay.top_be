import { Logger, Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ChapterController } from './chapter.controller';
import { ChapterRepository } from './chapter.repository';
import { S3Module } from '../image-storage/s3.module';

@Module({
  imports: [S3Module, TypeOrmModule.forFeature([Chapter]), JwtModule, UserModule],
  controllers: [ChapterController],
  providers: [ChapterService, Logger, ChapterRepository],
  exports: [ChapterService, ChapterRepository],
})
export class ChapterModule {}
