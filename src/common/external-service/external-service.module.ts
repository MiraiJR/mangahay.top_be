import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAdapterService } from './jwt/jwt.adapter';
import { MailService } from './mail/mail.service';
import { S3Service } from './image-storage/s3.service';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [],
  providers: [JwtAdapterService, JwtService, MailService, S3Service],
  exports: [JwtAdapterService, JwtService, MailService, S3Service],
})
export class ExternalServiceModule {}
