import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  body: string;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ nullable: true, name: 'redirect_url' })
  redirectUrl: string;

  @Column({ nullable: true })
  thumb: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;
}
