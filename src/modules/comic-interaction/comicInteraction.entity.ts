import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Comic } from '../comic/comic.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'comic_interaction' })
export class ComicInteraction {
  @Exclude()
  @PrimaryColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @Exclude()
  @PrimaryColumn({ name: 'comic_id' })
  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'comic_id' })
  comicId: number;

  @Column({ default: false, name: 'is_liked' })
  isLiked: boolean;

  @Column({ default: false, name: 'is_followed' })
  isFollowed: boolean;

  @Exclude()
  @Column({ nullable: true })
  score: number;
}
