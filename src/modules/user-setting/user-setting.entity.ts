import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { ChapterSetting } from './type/type';
import { ChapterViewType } from './enums/chapter-view-type';

@Entity({ name: 'user_setting' })
export class UserSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, (user) => user.setting, {
    cascade: ['remove', 'insert'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'chapter_setting',
    type: 'json',
    nullable: true,
    default: { type: ChapterViewType.DEFAULT, amount: 1 },
  })
  chapterSetting: ChapterSetting;
}
