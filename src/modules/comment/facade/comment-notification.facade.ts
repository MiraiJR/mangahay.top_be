import { QueueName } from '@common/constant/queue-channel';
import { UserRepository } from '@modules/user/user.repository';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Injectable()
export class CommentNotificationFacade {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectQueue(QueueName.NOTIFICAION) private notificationQueue: Queue,
  ) {}

  async notifyToListMentionedUser(
    sourceUserId: number,
    targetUserIds: number[],
    extraInformation: any,
  ) {
    const matchedSourceUserId = await this.userRepository.getUserById(sourceUserId);
    const targetUsers = await this.userRepository.getUsersByIds(targetUserIds);
    const jobs: Job[] = [];
    for (const targetUser of targetUsers) {
      if (!targetUser.setting.notification.mention) {
        continue;
      }

      const job = {
        data: {
          userId: targetUser.id,
          title: `Người dùng <strong>[${matchedSourceUserId.fullname}]</strong> nhắc đến bạn trong một bình luận!`,
          body: extraInformation?.content ?? '',
          module: 'comment',
          redirectUrl: extraInformation?.redirectUrl ?? '/',
          thumb: extraInformation?.thumb ?? '',
        },
        opts: {
          removeOnComplete: true,
          attempts: 3,
        },
      } as Job;
      jobs.push(job);
    }

    this.notificationQueue.addBulk(jobs);
  }
}
