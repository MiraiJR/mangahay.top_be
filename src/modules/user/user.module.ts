import { Global, Logger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ReadingHistoryModule } from '../reading-history/reading-history.module';
import { ComicModule } from '../comic/comic.module';
import { UserSettingModule } from '../user-setting/user-setting.module';
import { UserRepository } from './user.repository';
import { S3Service } from '../../common/external-service/image-storage/s3.service';
import { UserSession } from './user-sessions/user-session.entity';
import { UserSessionRepository } from './user-sessions/user-session.repository';
import { ElasticsearchAdapterModule } from '@common/external-service/elasticsearch/elasticsearch.module';
import { UserSocialEntity } from './user-social/user-social.entity';
import { UserSocialRepository } from './user-social/user-social.repository';
import { UserManageComicFacade } from './facades/user-manage-comic.facade';
import { UserManagementController } from './user-management/user-management.controller';
import { SearchUserController } from './search-user/search-user.controller';
import { SearchUserService } from './search-user/search-user.service';
import { UserUtilService } from './shared/user.util';
import { ComicUtilService } from '@modules/comic/shared/comic.util';
import { ReindexUserService } from './elasticsearch/services/reindex-users.service';
import { NotificationModule } from '@modules/notification/notification.module';

@Global()
@Module({
  imports: [
    JwtModule,
    ReadingHistoryModule,
    UserSettingModule,
    forwardRef(() => ComicModule),
    TypeOrmModule.forFeature([User, UserSession, UserSocialEntity]),
    ElasticsearchAdapterModule,
    NotificationModule,
  ],
  controllers: [UserController, UserManagementController, SearchUserController],
  providers: [
    UserService,
    Logger,
    UserRepository,
    S3Service,
    UserSessionRepository,
    UserSocialRepository,
    UserManageComicFacade,
    SearchUserService,
    UserUtilService,
    ComicUtilService,
    ReindexUserService,
  ],
  exports: [
    UserService,
    UserRepository,
    UserSessionRepository,
    UserSocialRepository,
    UserUtilService,
    ReindexUserService,
  ],
})
export class UserModule {}
