/* eslint-disable prettier/prettier */
import slugify from 'slugify';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string;

  @Column({nullable: false})
  name: string;

  @Column()
  another_name: string;

  @Column('text', { array: true })
  genres: string[];

  @Column('text', { array: true })
  authors: string[];

  @Column()
  state: string;

  @Column()
  thumb: string;

  @Column()
  brief_desc: string;

  @Column({default: 0})
  view: number;

  @Column({default: 0})
  like: number;

  @Column({default: 0})
  follow: number;

  @Column({default: 0})
  star: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt:  Date;

  @BeforeUpdate()
  updateTimeStamp() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.name, { lower: true });
  }
}
