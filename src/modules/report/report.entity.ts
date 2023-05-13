/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'reporter' })
  reporter: number;

  @Column({
    type: 'enum',
    enum: ['comic', 'chapter', 'comment'],
    default: 'chapter',
  })
  type: string;

  @Column({ nullable: true })
  detail_report: string;

  @Column('text', { array: true, nullable: true, default: [] })
  errors: string[];

  @Column({ nullable: false })
  id_object: number;

  @Column({nullable: false})
  link: string;
}
