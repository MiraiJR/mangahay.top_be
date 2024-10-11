import {
  AfterLoad,
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
import { User } from '../user/user.entity';
import { customSlugify } from 'src/common/configs/slugify.config';
import { ChapterType } from './types/ChapterType';
import { buildImageUrl } from 'src/common/utils/helper';

@Entity()
export class Chapter {
  @Index({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column('text', { array: true, nullable: true, default: () => 'ARRAY[]::text[]' })
  images: string[];

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

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  @Column({ name: 'creator_id', nullable: true })
  creator: number;

  @BeforeInsert()
  generateSlug() {
    this.slug = `${customSlugify(this.name)}`;
  }

  @BeforeUpdate()
  changeUpdatedAt() {
    this.updatedAt = new Date();
  }

  @AfterLoad()
  updateImage() {
    if (this.images) {
      this.images = this.images.map((image) => buildImageUrl(image));
    }
  }
}
