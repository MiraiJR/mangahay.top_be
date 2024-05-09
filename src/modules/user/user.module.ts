import { Logger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';
import { UserResolver } from './user.resolver';
import { ComicInteractionModule } from '../comic-interaction/comicInteraction.module';
import { ReadingHistoryModule } from '../reading-history/readingHistory.module';
import { RedisModule } from '../redis/redis.module';
import { ComicModule } from '../comic/comic.module';
import { UserSettingModule } from '../user-setting/user-setting.module';
import { UserRepository } from './user.repository';
import { S3Service } from '../image-storage/s3.service';

@Module({
  imports: [
    CloudinaryModule,
    JwtModule,
    NotificationModule,
    ComicInteractionModule,
    ReadingHistoryModule,
    RedisModule,
    UserSettingModule,
    forwardRef(() => ComicModule),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, UserResolver, Logger, UserRepository, S3Service],
  exports: [UserService, UserRepository],
})
export class UserModule {}
