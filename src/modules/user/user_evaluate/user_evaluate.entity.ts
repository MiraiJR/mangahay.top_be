/* eslint-disable prettier/prettier */
import { Comic } from 'src/modules/comic/comic.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class User_Evaluate_Comic {
  @PrimaryColumn()
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id_user' })
  id_user: number;

  @PrimaryColumn()
  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'id_comic' })
  id_comic: number;
}
