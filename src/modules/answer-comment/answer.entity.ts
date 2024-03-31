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
  @Column({ name: 'comment_id' })
  @ManyToOne(() => Comment, (comment) => comment.id, {
    cascade: ['remove'],
  })
  @JoinColumn({ name: 'comment_id' })
  commentId: number;

  @Exclude()
  @Column()
  @ManyToOne(() => User, (user) => user.id, {
    cascade: ['remove'],
  })
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @Column({ nullable: false })
  mentionedPerson: string;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
