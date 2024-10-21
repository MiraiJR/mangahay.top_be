import { JoinColumn, OneToOne } from 'typeorm';
import { User } from '../user.entity';

export class UserSessions {
  id: number;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
