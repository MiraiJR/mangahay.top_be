import {
  AfterUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user.entity';
import { ProviderType } from './social.enum';

@Entity({ name: 'user_socials' })
@Index(['id'], { unique: true })
export class UserSocialEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userSession, {
    cascade: ['remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'provider_type', enum: ProviderType, type: 'enum' })
  providerType: ProviderType;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @AfterUpdate()
  updateTime() {
    this.updatedAt = new Date();
  }
}
