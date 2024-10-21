import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@modules/user/user.entity';
import { Comic } from '../comic.entity';

@Entity({ name: 'user_interact_comic' })
export class ComicInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.comicInteractions, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Comic, (comic) => comic.comicInteractions, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comic_id' })
  comic: Comic;

  @Column({ name: 'comic_id' })
  comicId: number;

  @Column({ default: false, name: 'is_liked' })
  isLiked: boolean;

  @Column({ default: false, name: 'is_followed' })
  isFollowed: boolean;

  @Column({ nullable: true })
  score: number;
}
