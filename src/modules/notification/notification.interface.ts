export interface INotification {
  id?: number;
  id_user?: number;
  title?: string;
  body?: string;
  is_read?: boolean;
  redirect_url?: string;
  thumb?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
