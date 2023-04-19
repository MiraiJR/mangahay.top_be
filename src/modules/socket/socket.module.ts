import { CacheModule, Logger, Module, forwardRef } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    JwtModule,
    MessageModule,
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        // url: configService.get('REDIS_URL'),
        ttl: 120,
        ssl: true,
      }),
    }),
  ],
  controllers: [],
  providers: [SocketService, SocketGateway, Logger],
  exports: [SocketService],
})
export class SocketModule {}
