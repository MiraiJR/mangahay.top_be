import {
  AfterUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity({ name: 'user_sessions' })
@Index(['id', 'userId'], { unique: true })
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.userSession, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ nullable: true, name: 'refresh_token' })
  refreshToken: string;

  @Column({ nullable: true, name: 'access_token' })
  accessToken: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @AfterUpdate()
  updateTime() {
    this.updatedAt = new Date();
  }
}
