export interface INotification {
  id?: number;
  userId?: number;
  title?: string;
  body?: string;
  isRead?: boolean;
  redirectUrl?: string;
  thumb?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
