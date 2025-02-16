import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAdapterService } from './jwt/jwt.adapter';
import { MailService } from './mail/mail.service';
import { S3Service } from './image-storage/s3.service';
import { MailModule } from './mail/mail.module';
import { OAuth2Service } from './oauth2/oauth2.service';
import { QueueHandlerModule } from './queue-handler/queue-handler.module';
import { CrawlerService } from './crawler/crawler.service';
import { HttpModule } from '@nestjs/axios';
import { FacebookService } from './facebook/facebook.service';

@Global()
@Module({
  imports: [JwtModule.register({}), MailModule, QueueHandlerModule, HttpModule],
  controllers: [],
  providers: [
    JwtAdapterService,
    JwtService,
    MailService,
    S3Service,
    OAuth2Service,
    CrawlerService,
    FacebookService,
  ],
  exports: [
    JwtAdapterService,
    JwtService,
    MailService,
    S3Service,
    OAuth2Service,
    CrawlerService,
    FacebookService,
  ],
})
export class ExternalServiceModule {}
