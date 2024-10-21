import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Comic } from '../comic/comic.entity';
import { MentionedUser } from './mentioned-user/mentioned-user.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.id, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: CommentEntity;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.comments, {
    eager: true,
    cascade: ['remove'],
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'comic_id', type: 'int' })
  comicId: number;

  @ManyToOne(() => Comic, (comic) => comic.comments, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comic_id' })
  comic: Comic;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => CommentEntity, (comment) => comment.answers)
  answers: CommentEntity[];

  @OneToOne(() => MentionedUser, (mentionedUser) => mentionedUser.comment, { eager: true })
  mentionedUser: MentionedUser;
}
