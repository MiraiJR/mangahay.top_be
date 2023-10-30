import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Comic } from '../comic/comic.entity';
import { Chapter } from '../chapter/chapter.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class ReadingHistory {
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Exclude()
  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'comic_id' })
  @PrimaryColumn({ name: 'comic_id' })
  comicId: number;

  @Exclude()
  @ManyToOne(() => Chapter, (chapter) => chapter.id)
  @JoinColumn({ name: 'chapter_id' })
  @Column({ name: 'chapter_id', nullable: true })
  chapterId: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  readAt: Date;
}
