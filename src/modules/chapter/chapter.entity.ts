/* eslint-disable prettier/prettier */
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

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column('text', { array: true })
  images: string[];

  @ManyToOne(() => Comic, (comic) => comic.id)
  @JoinColumn({ name: 'id_comic' })
  id_comic: number;

  @Column({ nullable: false })
  slug: string;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }
}
