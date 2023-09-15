import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comic } from '../comic/comic.entity';
import slugify from 'slugify';
import { User } from '../user/user.entity';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @Column({ name: 'comic_id' })
  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'comic_id' })
  comicId: number;

  @Column({ nullable: false })
  slug: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'creator_id' })
  @Column({ name: 'create_id', nullable: true })
  creator: number;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }

  @BeforeUpdate()
  changeUpdatedAt() {
    this.updatedAt = new Date();
  }
}
