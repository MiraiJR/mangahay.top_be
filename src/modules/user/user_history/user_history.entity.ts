/* eslint-disable prettier/prettier */
import { Chapter } from 'src/modules/chapter/chapter.entity';
import { Comic } from 'src/modules/comic/comic.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class UserHistory {
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id_user' })
  @PrimaryColumn()
  id_user: number;

  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'id_comic' })
  @PrimaryColumn()
  id_comic: number;

  @ManyToOne(() => Chapter, (chapter) => chapter.id)
  @JoinColumn({ name: 'id_chapter' })
  @Column()
  id_chapter: number;
}
