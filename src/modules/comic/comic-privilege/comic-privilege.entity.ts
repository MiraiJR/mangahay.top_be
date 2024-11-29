import { User } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Comic } from '../comic.entity';

@Entity({ name: 'comic_privileges' })
export class ComicPrivilegeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'comic_id' })
  comicId: number;

  @ManyToOne(() => Comic, (comic) => comic.privileges, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comic_id' })
  comic: Comic;

  @Column('int', { array: true, default: [0] })
  permissions: number[];
}
