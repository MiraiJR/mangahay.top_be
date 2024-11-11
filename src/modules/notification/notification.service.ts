import { Injectable } from '@nestjs/common';
import { INotification } from './notification.interface';
import { NotificationType } from '../user/types/NotificationType';
import { NotificationRepository } from './notification.repository';
import { ApplicationException } from '@common/exception/application.exception';
import NotificationError from './resources/error/error';

@Injectable()
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  create(notify: INotification) {
    return this.notificationRepository.save({
      ...notify,
    });
  }

  async getNotificationThrowIfNotExisted(id: number) {
    const notify = await this.notificationRepository.findById(id);
    if (!notify) {
      throw new ApplicationException(NotificationError.NOTIFICATION_ERROR_0001);
    }

    return notify;
  }

  async changeStateNotify(userId: number, notifyId: number) {
    const notify = await this.getNotificationThrowIfNotExisted(notifyId);

    if (notify.userId !== userId) {
      throw new ApplicationException(NotificationError.NOTIFICATION_ERROR_0002);
    }

    return this.notificationRepository.save({
      ...notify,
      isRead: true,
    });
  }

  countUnread(userId: number) {
    return this.notificationRepository.countUnreadOfUser(userId);
  }

  getNotifiesOfUser(userId: number, notificationType: NotificationType = NotificationType.BOTH) {
    switch (notificationType) {
      case NotificationType.READ:
        return this.notificationRepository.getListNotificationOfUser(userId, true);
      case NotificationType.UNREAD:
        return this.notificationRepository.getListNotificationOfUser(userId, false);
      case NotificationType.BOTH:
        return this.notificationRepository.getListNotificationOfUser(userId, true, true);
      default:
        return [];
    }
  }

  changeAllStateOfUser(userId: number, isRead: boolean) {
    return this.notificationRepository.changeIsReadForListNotificationOfUser(userId, isRead);
  }

  removeAllNotificationsOfUser(userId: number) {
    return this.notificationRepository.deleteAllNotificationOfUser(userId);
  }
}
