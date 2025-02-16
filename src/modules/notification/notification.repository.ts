import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { Paging } from '@common/types/Paging';

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

  async getListNotificationOfUser(userId: number, isRead: boolean, paging?: Paging) {
    let queryBuilder = this.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isRead = :isRead', { isRead })
      .orderBy('notification.createdAt', 'DESC');

    if (paging) {
      const { page, limit } = paging;
      queryBuilder = queryBuilder.offset((page - 1) * limit).limit(limit);
    }

    const [records, totalRecords] = await queryBuilder.getManyAndCount();

    return {
      total: totalRecords,
      notifications: records,
    };
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
