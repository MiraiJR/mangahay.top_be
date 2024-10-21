import {
  AfterLoad,
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
import { User } from '../user/user.entity';
import { Chapter } from '../chapter/chapter.entity';
import { CommentEntity } from '../comment/comment.entity';
import { customSlugify } from 'src/common/configs/slugify.config';
import { StatusComic } from './enums/status-comic';
import { buildImageUrl } from 'src/common/utils/helper';
import { ComicInteraction } from './comic-interaction/comicInteraction.entity';

@Entity()
@Index(['id', 'slug', 'name', 'anotherName', 'briefDescription'], { unique: true, fulltext: true })
export class Comic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'another_name' })
  anotherName: string;

  @Column('text', { array: true })
  genres: string[];

  @Column('text', { array: true, default: ['Đang cập nhật'] })
  authors: string[];

  @Column({ default: StatusComic.PROCESSING })
  state: StatusComic;

  @Column({ nullable: true })
  thumb: string;

  @Column({ name: 'brief_description' })
  briefDescription: string;

  @Column({ default: 0 })
  view: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  star: number;

  @Column({ name: 'creator_id', nullable: true })
  creatorId: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @Column('text', { array: true, default: [] })
  translators: string[];

  @OneToMany(() => Chapter, (chapter) => chapter.comic, { eager: true })
  chapters: Chapter[];

  @OneToMany(() => ComicInteraction, (comicInteraction) => comicInteraction.comic, {
    lazy: true,
  })
  comicInteractions: ComicInteraction[];

  @OneToMany(() => CommentEntity, (comment) => comment.comic, {
    eager: true,
  })
  comments: CommentEntity[];

  @BeforeUpdate()
  updateTimeStamp() {
    this.slug = `${customSlugify(this.name)}-${Date.now()}`;
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  generateSlug() {
    this.slug = `${customSlugify(this.name)}-${Date.now()}`;
  }

  @AfterLoad()
  updateImage() {
    this.thumb = buildImageUrl(this.thumb);
  }
}
