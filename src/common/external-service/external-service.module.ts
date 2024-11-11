import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAdapterService } from './jwt/jwt.adapter';
import { MailService } from './mail/mail.service';
import { S3Service } from './image-storage/s3.service';
import { MailModule } from './mail/mail.module';
import { OAuth2Service } from './oauth2/oauth2.service';
import { QueueHandlerModule } from './queue-handler/queue-handler.module';

@Global()
@Module({
  imports: [JwtModule.register({}), MailModule, QueueHandlerModule],
  controllers: [],
  providers: [JwtAdapterService, JwtService, MailService, S3Service, OAuth2Service],
  exports: [JwtAdapterService, JwtService, MailService, S3Service, OAuth2Service],
})
export class ExternalServiceModule {}
