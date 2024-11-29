import { QueueName } from '@common/constant/queue-channel';
import { Process, Processor } from '@nestjs/bull';
import { NotificationRepository } from './notification.repository';
import { NotificationEvent } from './notification.interface';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor(QueueName.NOTIFICAION)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(private readonly notificationRepository: NotificationRepository) {}

  @Process()
  async sendNotificationForCreatedNewChapter(job: Job<NotificationEvent>) {
    this.notificationRepository.save({
      ...job.data,
    });
  }
}
