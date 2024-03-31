import slugify from 'slugify';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

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

  @Column({ default: 'Đang tiến hành' })
  state: string;

  @Column({
    default:
      'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/341188300_174106015556678_2351278697571809870_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=730e14&_nc_ohc=_7_-WoYue4sAX8peRhA&_nc_ht=scontent.fsgn19-1.fna&oh=00_AfD-YleH181ekrLJecohF7ePxk2nQzkF3JtHjTqdOjlGwA&oe=643E4400',
  })
  thumb: string;

  @Column({ name: 'brief_description' })
  briefDescription: string;

  @Column({ default: 0 })
  view: number;

  @Column({ default: 0 })
  like: number;

  @Column({ default: 0 })
  follow: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  star: number;

  @ManyToOne(() => User, (user) => user.id)
  @Column({ nullable: true })
  creator: number;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @Column('text', { array: true, default: [] })
  translators: string[];

  @BeforeUpdate()
  updateTimeStamp() {
    this.slug = `${slugify(this.name, { lower: true })}`;
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  generateSlug() {
    this.slug = `${slugify(this.name, { lower: true })}`;
  }
}
