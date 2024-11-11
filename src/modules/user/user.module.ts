import { Global, Logger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ReadingHistoryModule } from '../reading-history/readingHistory.module';
import { ComicModule } from '../comic/comic.module';
import { UserSettingModule } from '../user-setting/user-setting.module';
import { UserRepository } from './user.repository';
import { S3Service } from '../../common/external-service/image-storage/s3.service';
import { UserSession } from './user-sessions/user-session.entity';
import { UserSessionRepository } from './user-sessions/user-session.repository';
import { ElasticsearchAdapterModule } from '@common/external-service/elasticsearch/elasticsearch.module';
import { UserSocialEntity } from './user-social/user-social.entity';
import { UserSocialRepository } from './user-social/user-social.repository';

@Global()
@Module({
  imports: [
    JwtModule,
    ReadingHistoryModule,
    UserSettingModule,
    forwardRef(() => ComicModule),
    TypeOrmModule.forFeature([User, UserSession, UserSocialEntity]),
    ElasticsearchAdapterModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    Logger,
    UserRepository,
    S3Service,
    UserSessionRepository,
    UserSocialRepository,
  ],
  exports: [UserService, UserRepository, UserSessionRepository, UserSocialRepository],
})
export class UserModule {}
