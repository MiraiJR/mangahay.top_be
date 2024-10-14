import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ExternalServiceModule } from '@common/external-service/external-service.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    TypeOrmModule.forFeature([User]),
    HttpModule,
    ExternalServiceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger],
  exports: [AuthService],
})
export class AuthModule {}
