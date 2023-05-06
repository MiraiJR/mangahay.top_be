/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.role';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    default:
      'https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg',
  })
  avatar: string;

  @Column({nullable: true})
  wallpaper: string;

  @Column({default: false})
  active: boolean;

  @Column({default: false})
  facebook: boolean;

  @Column({nullable: true})
  phone: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'translator', 'viewer'],
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'now()'})
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
