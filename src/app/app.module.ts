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
import { ScheduleModule } from '@nestjs/schedule';
import { SocketModule } from '../modules/socket/socket.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MessageModule } from '../modules/message/message.module';
import { AdminModule } from '../modules/admin/admin.module';
import { ReportModule } from '../modules/report/report.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ChapterModule,
    ComicModule,
    CommentModule,
    SocketModule,
    NotificationModule,
    MessageModule,
    AdminModule,
    ReportModule,
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
        ssl: true,
      }),
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
