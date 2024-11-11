import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(
    @InjectRepository(Notification)
    repository: Repository<Notification>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findById(id: number) {
    return this.findOne({
      where: {
        id,
      },
    });
  }

  countUnreadOfUser(userId: number) {
    return this.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  getListNotificationOfUser(userId: number, isRead: boolean, isAll: boolean = false) {
    if (isAll) {
      return this.find({
        where: {
          userId,
        },
      });
    }

    return this.find({
      where: {
        userId,
        isRead,
      },
    });
  }

  changeIsReadForListNotificationOfUser(userId: number, isRead: boolean) {
    return this.update(
      {
        userId,
      },
      {
        isRead,
      },
    );
  }

  deleteAllNotificationOfUser(userId: number) {
    return this.createQueryBuilder()
      .delete()
      .from(Notification)
      .where('userId = :userId', { userId })
      .execute();
  }
}
