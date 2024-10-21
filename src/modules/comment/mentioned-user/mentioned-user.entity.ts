import { User } from '@modules/user/user.entity';
import { CommentEntity } from '../comment.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'comment_mentions' })
export class MentionedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'comment_id' })
  commentId: number;

  @OneToOne(() => CommentEntity, (comment) => comment.id, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: CommentEntity;

  @Column({ name: 'mentioned_user_id', nullable: true })
  mentionedUserId: number;

  @ManyToOne(() => User, (user) => user.mentionedUsers, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser: User;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;
}
