import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { INotification } from './notification.interface';
import { NotificationType } from '../user/types/NotificationType';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(notify: INotification) {
    return await this.notificationRepository.save({
      ...notify,
    });
  }

  async changeStateNotify(userId: number, notifyId: number) {
    const notify = await this.notificationRepository.findOne({
      where: {
        id: notifyId,
      },
    });

    if (!notify) {
      throw new HttpException(
        `Thông báo với id [${notifyId}] không tồn tại!`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (notify.userId !== userId) {
      throw new HttpException(`Không có quyền!`, HttpStatus.FORBIDDEN);
    }

    return this.notificationRepository.save({
      ...notify,
      isRead: true,
    });
  }

  async update(notify: INotification) {
    return await this.notificationRepository.save({
      id: notify.id,
      ...notify,
    });
  }

  async countUnread(id_user: number) {
    return await this.notificationRepository
      .createQueryBuilder('notifies')
      .where('notifies.id_user = :idUser', { idUser: id_user })
      .andWhere('notifies.is_read = :unread', { unread: false })
      .getCount();
  }

  async getNotifiesOfUser(
    userId: number,
    typeNotification: NotificationType = NotificationType.BOTH,
  ) {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user = :userId', { userId });

    if (typeNotification !== NotificationType.BOTH) {
      query.andWhere('notification.isRead = :isRead', {
        isRead: typeNotification === NotificationType.READ,
      });
    }

    query.orderBy('notification.isRead', 'ASC');
    query.addOrderBy('notification.createdAt', 'DESC');

    return query.getMany();
  }

  async changeAllStateOfUser(id_user: number, status: boolean) {
    return await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: status })
      .where('user = :id_user', { id_user: id_user })
      .andWhere('isRead = false')
      .execute();
  }

  async removeAllNotificationsOfUser(userId: number) {
    return await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('user = :id', { id: userId })
      .execute();
  }
}
