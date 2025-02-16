import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';

export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getAllUser() {
    return this.find();
  }

  getUserById(userId: number): Promise<User> {
    return this.findOne({
      where: {
        id: userId,
      },
    });
  }

  getUsersByIds(userIds: number[]): Promise<User[]> {
    return this.find({
      where: {
        id: In(userIds),
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
