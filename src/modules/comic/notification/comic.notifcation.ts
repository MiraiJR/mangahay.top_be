import { Injectable } from '@nestjs/common';
import { ComicPrivilegeRepository } from '../comic-privilege/comic-privilege.repository';
import { Comic } from '../comic.entity';
import { UserRepository } from '@modules/user/user.repository';
import { Job, Queue } from 'bull';
import { NotificationEvent } from '@modules/notification/notification.interface';
import { QueueName } from '@common/constant/queue-channel';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class ComicNotificationService {
  constructor(
    private readonly comicPrivilegeRepository: ComicPrivilegeRepository,
    private readonly userRepository: UserRepository,
    @InjectQueue(QueueName.NOTIFICAION) private notificationQueue: Queue,
  ) {}

  async sendNotifyToListManagerAfterUpdatingComic(
    updatorId: number,
    comic: Comic,
    changedField: string[],
  ) {
    const listManagerIdsOfComic = await this.comicPrivilegeRepository.getManagerIdsOfComicId(
      comic.id,
    );

    if (!listManagerIdsOfComic.includes(comic.creatorId)) {
      listManagerIdsOfComic.push(comic.creatorId);
    }

    const notificationJobs = await this.buildBulkNotificationEventToListManagerAfterUpdatingComic(
      updatorId,
      comic,
      changedField,
      listManagerIdsOfComic.filter((managerId) => managerId !== updatorId), // not send to updator of comic
    );

    this.notificationQueue.addBulk(notificationJobs);
  }

  private async buildBulkNotificationEventToListManagerAfterUpdatingComic(
    updatorId: number,
    comic: Comic,
    changedField: string[],
    managerIds: number[],
  ): Promise<Job<NotificationEvent>[]> {
    const updator = await this.userRepository.getUserById(updatorId);

    return managerIds.map((managerId) => {
      return {
        data: {
          userId: managerId,
          title: `Truyện ${comic.name} vừa thay đổi thông tin!`,
          body: `Người dùng <strong>${
            updator.fullname
          }</strong> thay đổi thông tin [${changedField.join(', ')}]!`,
          module: 'comic',
          redirectUrl: `/truyen/${comic.slug}`,
          thumb: comic.thumb,
        },
        opts: {
          removeOnComplete: true,
          attempts: 3,
        },
      } as Job;
    });
  }
}
