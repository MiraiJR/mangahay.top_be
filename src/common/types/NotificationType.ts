export enum NotificationType {
  UNREAD = 0,
  READ = 1,
  BOTH = 2,
}

export const toNotificationType = (value: string | number): NotificationType => {
  const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;

  switch (numericValue) {
    case NotificationType.UNREAD:
      return NotificationType.UNREAD;
    case NotificationType.READ:
      return NotificationType.READ;
    default:
      return NotificationType.BOTH;
  }
};
