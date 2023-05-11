import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ComicModule } from 'src/modules/comic/comic.module';
import { ChapterModule } from 'src/modules/chapter/chapter.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/user/user.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SocketModule } from 'src/modules/socket/socket.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MessageModule } from 'src/modules/message/message.module';
import { AdminModule } from 'src/modules/admin/admin.module';

const is_ssl: boolean = process.env.NODE_ENV === 'production' ? true : false;

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
        ssl: is_ssl,
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
