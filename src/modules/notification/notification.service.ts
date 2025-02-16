import { Injectable } from '@nestjs/common';
import { INotification } from './interface';
import { NotificationType } from '../../common/types/NotificationType';
import { NotificationRepository } from './notification.repository';
import { ApplicationException } from '@common/exception/application.exception';
import NotificationError from './resources/error/error';
import { GetNotificationsRequest } from './dtos/get-notifications';

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

  async handleGetNotificationsOfUser(userId: number, query: GetNotificationsRequest) {
    const { type: notificationType, page, size } = query;

    if (
      notificationType === NotificationType.READ ||
      notificationType === NotificationType.UNREAD
    ) {
      const { total, notifications } = await this.notificationRepository.getListNotificationOfUser(
        userId,
        notificationType === NotificationType.READ,
        { page, limit: size },
      );
      const hasNext = total - page * size > 0;
      return {
        total,
        data: notifications,
        hasNext,
      };
    }

    return {
      query,
      total: 0,
      data: [],
      hasNext: false,
    };
  }

  changeAllStateOfUser(userId: number, isRead: boolean) {
    return this.notificationRepository.changeIsReadForListNotificationOfUser(userId, isRead);
  }

  removeAllNotificationsOfUser(userId: number) {
    return this.notificationRepository.deleteAllNotificationOfUser(userId);
  }
}
