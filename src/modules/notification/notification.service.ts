import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { INotification } from './notification.interface';
import { SocketService } from '../socket/socket.service';

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

  async changeState(id_notify: number) {
    return await this.notificationRepository.save({
      id: id_notify,
      is_read: true,
    });
  }

  async update(notify: INotification) {
    return await this.notificationRepository.save({
      id: notify.id,
      ...notify,
    });
  }

  async notifyToUser(notify: INotification) {
    const user_socket = await this.socketService.checkUserOnline(
      notify.id_user,
    );

    if (user_socket) {
      this.socketService
        .getSocket()
        .to(user_socket)
        .emit('notification_user', notify);
    }
  }

  async countUnread(id_user: number) {
    return await this.notificationRepository
      .createQueryBuilder('notifies')
      .where('notifies.id_user = :idUser', { idUser: id_user })
      .andWhere('notifies.is_read = :unread', { unread: false })
      .getCount();
  }

  async getNotifiesOfUser(id_user: number, query: any) {
    return await this.notificationRepository.find({
      where: {
        id_user: id_user,
      },
      order: {
        createdAt: 'DESC',
      },
      take: parseInt(query.limit),
      skip: (parseInt(query.page) - 1) * parseInt(query.limit),
    });
  }

  async checkOwner(id_user: number, id_notify: number) {
    const check = await this.notificationRepository.findOne({
      where: {
        id_user: id_user,
        id: id_notify,
      },
    });

    return check ? true : false;
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
