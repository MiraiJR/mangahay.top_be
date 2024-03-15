import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { INotification } from './notification.interface';
import { SocketService } from '../socket/socket.service';
import { NotificationType } from '../user/types/NotificationType';

@Injectable()
export class NotificationService {
  constructor(
    private socketService: SocketService,
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

  async notifyToUser(notify: INotification) {
    const user_socket = await this.socketService.checkUserOnline(notify.userId);

    if (user_socket) {
      this.socketService.getSocket().to(user_socket).emit('notification_user', notify);
    }
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
    if (typeNotification !== NotificationType.BOTH) {
      return this.notificationRepository.find({
        where: {
          isRead: typeNotification === NotificationType.READ,
        },
        order: {
          isRead: 'ASC',
          createdAt: 'DESC',
        },
      });
    }

    return this.notificationRepository.find({
      where: {
        userId,
      },
      order: {
        isRead: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async changeAllStateOfUser(id_user: number) {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .update('notification')
      .set({ is_read: true })
      .where('notification.id_user = :id_user', { id_user: id_user })
      .andWhere('notification.is_read = false')
      .execute();
  }
}
