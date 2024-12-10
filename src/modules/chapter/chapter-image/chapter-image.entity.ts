import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chapter } from '../chapter.entity';
import { buildImageUrl } from '@common/utils/helper';

@Entity({ name: 'chapter_images' })
export class ChapterImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chapter, (chapter) => chapter.images, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  @Column({ name: 'chapter_id' })
  chapterId: number;

  @Column({
    name: 'relative_path',
    transformer: {
      to: (value: string) => value,
      from: (value: string) => buildImageUrl(value),
    },
  })
  relativePath: string;

  @Column()
  position: number;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'updated_at' })
  updatedAt: Date;
}
