/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from '../comment.entity';
import { User } from '../../user/user.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(() => Comment, (comment) => comment.id)
  @JoinColumn({ name: 'id_comment' })
  id_comment: number;

  @Column()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id_user' })
  id_user: number;

  @Column({ nullable: false })
  answer_user: string;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
