import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'answer_comment' })
export class Answer {
  @Index({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ name: 'comment_id', type: 'int' })
  @ManyToOne(() => Comment, (comment) => comment.answers, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @Exclude()
  @Column({ name: 'user_id', type: 'int' })
  @ManyToOne(() => User, (user) => user.answers, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: false })
  mentionedPerson: string;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
