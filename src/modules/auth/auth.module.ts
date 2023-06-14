import { CacheModule, Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { MailService } from 'src/common/utils/mail-service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
    HttpModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        // url: configService.get('REDIS_URL'),
        password: configService.get('REDIS_PASSWORD'),
        ttl: 120,
        ssl: true,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, Logger],
  exports: [AuthService],
})
export class AuthModule {}
