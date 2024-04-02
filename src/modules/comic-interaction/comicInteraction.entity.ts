import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Comic } from '../comic/comic.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'comic_interaction' })
export class ComicInteraction {
  @Exclude()
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  @ManyToOne(() => User, (user) => user.comicInteractions, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Exclude()
  @PrimaryColumn({ name: 'comic_id', type: 'int' })
  @ManyToOne(() => Comic, (comic) => comic.comicInteractions, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comic_id' })
  comic: Comic;

  @Column({ default: false, name: 'is_liked' })
  isLiked: boolean;

  @Column({ default: false, name: 'is_followed' })
  isFollowed: boolean;

  @Exclude()
  @Column({ nullable: true })
  score: number;
}
