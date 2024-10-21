import { AfterLoad, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.role';
import { Exclude } from 'class-transformer';
import { CommentEntity } from '../comment/comment.entity';
import { Notification } from '../notification/notification.entity';
import { UserSettingEntity } from '../user-setting/user-setting.entity';
import { buildImageUrl } from 'src/common/utils/helper';
import { ComicInteraction } from '@modules/comic/comic-interaction/comicInteraction.entity';
import { MentionedUser } from '@modules/comment/mentioned-user/mentioned-user.entity';

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
    nullable: true,
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

  @OneToMany(() => CommentEntity, (comment) => comment.user, { lazy: true })
  comments: CommentEntity[];

  @OneToMany(() => ComicInteraction, (comicInteraction) => comicInteraction.user, { lazy: true })
  comicInteractions: ComicInteraction[];

  @OneToMany(() => Notification, (notification) => notification.user, { lazy: true })
  notifications: Notification[];

  @OneToOne(() => UserSettingEntity, (setting) => setting.user, {
    eager: true,
  })
  setting: UserSettingEntity;

  @OneToMany(() => MentionedUser, (mentionedUser) => mentionedUser.mentionedUser)
  mentionedUsers: MentionedUser[];

  @AfterLoad()
  updateImage() {
    this.avatar = buildImageUrl(this.avatar);
  }
}
