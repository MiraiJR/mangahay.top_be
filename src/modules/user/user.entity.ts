import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.role';
import { Exclude } from 'class-transformer';
import { CommentEntity } from '../comment/comment.entity';
import { Notification } from '../notification/notification.entity';
import { UserSettingEntity } from '../user-setting/user-setting.entity';
import { buildImageUrl } from 'src/common/utils/helper';
import { ComicInteraction } from '@modules/comic/comic-interaction/comic-interaction.entity';
import { MentionedUser } from '@modules/comment/mentioned-user/mentioned-user.entity';
import { UserSession } from './user-sessions/user-session.entity';
import { UserSocialEntity } from './user-social/user-social.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  fullname: string;

  @Column({
    nullable: true,
    transformer: {
      to: (value: string) => value,
      from: (value: string) => buildImageUrl(value),
    },
  })
  avatar: string;

  @Column({ nullable: true })
  wallpaper: string;

  @Exclude()
  @Column({ default: false })
  active: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'translator', 'viewer'],
    default: UserRole.VIEWER,
  })
  role: UserRole;

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

  @OneToOne(() => UserSession, (userSession) => userSession.user, { eager: false })
  userSession: UserSession;

  @OneToMany(() => UserSocialEntity, (userSocial) => userSocial.user, { eager: false })
  socials: UserSocialEntity[];
}
