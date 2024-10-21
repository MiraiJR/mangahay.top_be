import { Logger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { UserResolver } from './user.resolver';
import { ReadingHistoryModule } from '../reading-history/readingHistory.module';
import { ComicModule } from '../comic/comic.module';
import { UserSettingModule } from '../user-setting/user-setting.module';
import { UserRepository } from './user.repository';
import { S3Service } from '../../common/external-service/image-storage/s3.service';
import { ComicInteractionModule } from '@modules/comic/comic-interaction/comicInteraction.module';

@Module({
  imports: [
    JwtModule,
    NotificationModule,
    ComicInteractionModule,
    ReadingHistoryModule,
    UserSettingModule,
    forwardRef(() => ComicModule),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, UserResolver, Logger, UserRepository, S3Service],
  exports: [UserService, UserRepository],
})
export class UserModule {}
