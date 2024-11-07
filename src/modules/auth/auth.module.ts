import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ExternalServiceModule } from '@common/external-service/external-service.module';
import { AccountEntity } from './account/account.entity';
import { AccountRepository } from './account/account.repository';
import { CreateAccoutUserFacade } from './facade/create-account-user.facade';
import { ElasticsearchAdapterModule } from '@common/external-service/elasticsearch/elasticsearch.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    TypeOrmModule.forFeature([AccountEntity]),
    HttpModule,
    ExternalServiceModule,
    ElasticsearchAdapterModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger, AccountRepository, CreateAccoutUserFacade],
  exports: [AuthService],
})
export class AuthModule {}
