import { ApplicationException } from '@common/exception/application.exception';
import CommonError from '@common/resources/error/error';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private logger: Logger;
  constructor(private readonly mailerService: MailerService) {
    this.logger = new Logger(MailService.name);
  }

  async sendMail<T>(
    email: string,
    subject: string,
    template: MailTemplate,
    data: T,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: template,
        context: {
          data,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new ApplicationException(CommonError.COMMON_ERROR_0002);
    }
  }
}
