import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getUserById(userId: number): Promise<User> {
    return this.findOne({
      where: {
        id: userId,
      },
    });
  }

  getUserByEmail(email: string) {
    return this.findOne({
      where: {
        email,
      },
    });
  }

  getUserByPhone(phone: string) {
    return this.findOne({
      where: {
        phone,
      },
    });
  }

  updateAvatar(userId: number, newAvatar: string) {
    return this.update(
      {
        id: userId,
      },
      {
        avatar: newAvatar,
        updatedAt: new Date(),
      },
    );
  }
}
