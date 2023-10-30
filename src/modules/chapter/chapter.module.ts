import { Logger, Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ChapterController } from './chapter.controller';

@Module({
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Chapter]), JwtModule, UserModule],
  controllers: [ChapterController],
  providers: [ChapterService, Logger],
  exports: [ChapterService],
})
export class ChapterModule {}
