import { QueueName } from '@common/constant/queue-channel';
import { Process, Processor } from '@nestjs/bull';
import { NotificationRepository } from './notification.repository';
import { NotificationEvent } from './interface';
import { Job } from 'bull';

@Processor(QueueName.NOTIFICAION)
export class NotificationProcessor {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  @Process()
  async sendNotification(job: Job<NotificationEvent>) {
    this.notificationRepository.save({
      ...job.data,
    });
  }
}
