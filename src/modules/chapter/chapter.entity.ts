import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comic } from '../comic/comic.entity';
import slugify from 'slugify';
import { User } from '../user/user.entity';

@Entity()
export class Chapter {
  @Index({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column('text', { array: true, nullable: true })
  images: string[];

  @ManyToOne(() => Comic, (comic) => comic.chapters, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comic_id' })
  comic: Comic;

  @Column({ nullable: false })
  slug: string;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  order: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  @Column({ name: 'creator_id', nullable: true })
  creator: number;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }

  @BeforeUpdate()
  changeUpdatedAt() {
    this.updatedAt = new Date();
  }
}
