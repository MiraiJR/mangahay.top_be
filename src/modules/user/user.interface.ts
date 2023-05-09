import { UserRole } from './user.role';

export interface IUser {
  id?: number;
  email?: string;
  fullname?: string;
  password?: string;
  avatar?: string;
  wallpaper?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  phone?: string;
  facebook?: boolean;
  id_facebook?: string;
  google?: boolean;
  id_google?: string;
  active?: boolean;
}
