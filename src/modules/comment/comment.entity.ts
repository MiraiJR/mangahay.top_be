import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Comic } from '../comic/comic.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @Exclude()
  @Column({ name: 'comic_id' })
  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'comic_id' })
  comicId: number;

  @Column({ nullable: false })
  content: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
