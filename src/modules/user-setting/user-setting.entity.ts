import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { ChapterSetting } from './type/type';
import { ChapterViewType } from './enums/chapter-view-type';
import { Exclude } from 'class-transformer';

@Entity({ name: 'user_setting' })
export class UserSettingEntity {
  @Exclude()
  @PrimaryColumn({ type: 'int', name: 'user_id' })
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
