import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ComicModule } from '../modules/comic/comic.module';
import { ChapterModule } from '../modules/chapter/chapter.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { CommentModule } from '../modules/comment/comment.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MessageModule } from '../modules/message/message.module';
import { AdminModule } from '../modules/admin/admin.module';
import { ReportModule } from '../modules/report/report.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReadingHistoryModule } from 'src/modules/reading-history/readingHistory.module';
import { GenreModule } from 'src/modules/genre/genre.module';
import { GoogleApiModule } from 'src/modules/google-api/google-api.module';
import { UserSettingModule } from 'src/modules/user-setting/user-setting.module';
import { QueueHandlerModule } from 'src/modules/queue-handler/queue-handler.module';
import { ExternalServiceModule } from '@common/external-service/external-service.module';
import { ComicInteractionModule } from '@modules/comic/comic-interaction/comicInteraction.module';

@Module({
  imports: [
    ExternalServiceModule,
    QueueHandlerModule,
    AuthModule,
    UserModule,
    ComicModule,
    CommentModule,
    NotificationModule,
    MessageModule,
    AdminModule,
    ReportModule,
    ChapterModule,
    ComicInteractionModule,
    ReadingHistoryModule,
    GenreModule,
    GoogleApiModule,
    UserSettingModule,
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
