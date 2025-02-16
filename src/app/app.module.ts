import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ComicModule } from '../modules/comic/comic.module';
import { ChapterModule } from '../modules/chapter/chapter.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { CommentModule } from '../modules/comment/comment.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { ReadingHistoryModule } from '@modules/reading-history/reading-history.module';
import { GenreModule } from 'src/modules/genre/genre.module';
import { GoogleApiModule } from '@common/external-service/google-api/google-api.module';
import { UserSettingModule } from 'src/modules/user-setting/user-setting.module';
import { QueueHandlerModule } from '@common/external-service/queue-handler/queue-handler.module';
import { ExternalServiceModule } from '@common/external-service/external-service.module';
import { SystemDataModule } from '@modules/system-data/system-data.module';
import { ScheduleJobModule } from '@common/schedule-job/schedule-job.module';

@Module({
  imports: [
    ExternalServiceModule,
    QueueHandlerModule,
    AuthModule,
    UserModule,
    ComicModule,
    CommentModule,
    NotificationModule,
    ChapterModule,
    ReadingHistoryModule,
    GenreModule,
    GoogleApiModule,
    UserSettingModule,
    SystemDataModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    ScheduleJobModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
