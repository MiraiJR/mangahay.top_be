import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.role';
import { Exclude } from 'class-transformer';
import { Comment } from '../comment/comment.entity';
import { Answer } from '../answer-comment/answer.entity';
import { ComicInteraction } from '../comic-interaction/comicInteraction.entity';
import { Notification } from '../notification/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  fullname: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: false })
  password: string;

  @Column({
    default: 'https://i.pinimg.com/originals/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg',
  })
  avatar: string;

  @Column({ nullable: true })
  wallpaper: string;

  @Exclude()
  @Column({ default: false })
  active: boolean;

  @Exclude()
  @Column({ default: false })
  facebook: boolean;

  @Exclude()
  @Column({ nullable: true })
  facebookId: string;

  @Exclude()
  @Column({ default: false })
  google: boolean;

  @Exclude()
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'translator', 'viewer'],
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Exclude()
  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string;

  @Exclude()
  @Column({ nullable: true, name: 'access_token' })
  accessToken: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.user, { lazy: true })
  comments: Comment[];

  @OneToMany(() => Answer, (answer) => answer.user, { lazy: true })
  answers: Answer[];

  @OneToMany(() => ComicInteraction, (comicInteraction) => comicInteraction.user, { lazy: true })
  comicInteractions: ComicInteraction[];

  @OneToMany(() => Notification, (notification) => notification.user, { lazy: true })
  notifications: Notification[];
}
