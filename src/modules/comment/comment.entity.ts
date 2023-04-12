/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Comic } from '../comic/comic.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id_user' })
  id_user: number;

  @Column()
  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'id_comic' })
  id_comic: number;

  @Column({ nullable: false })
  content: string;

  answer: any[];

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
