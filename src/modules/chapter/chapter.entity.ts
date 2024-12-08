import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comic } from '../comic/comic.entity';
import { User } from '../user/user.entity';
import { customSlugify } from 'src/common/configs/slugify.config';
import { ChapterType } from './types/ChapterType';
import { ChapterImageEntity } from './chapter-image/chapter-image.entity';

@Entity()
export class Chapter {
  @Index({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'comic_id' })
  comicId: number;

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

  @Column({ type: 'enum', enum: ChapterType, default: ChapterType.NORMAL })
  type: ChapterType;

  @Column({ name: 'creator_id', nullable: true })
  creatorId: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  creator: number;

  @OneToMany(() => ChapterImageEntity, (images) => images.chapter)
  images: ChapterImageEntity[];

  @BeforeInsert()
  generateSlug() {
    this.slug = `${customSlugify(this.name)}`;
  }

  @BeforeUpdate()
  changeUpdatedAt() {
    this.updatedAt = new Date();
  }
}
