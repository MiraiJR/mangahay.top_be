import { CacheModule, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    JwtModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<any> => ({
        store: redisStore,
        // host: configService.get('REDIS_HOST'),
        // port: configService.get('REDIS_PORT'),
        url: configService.get('REDIS_URL'),
        ttl: 120,
        ssl: true,
      }),
    }),
  ],
  controllers: [],
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
