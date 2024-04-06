import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { IUser } from './user.interface';

export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getUserById(userId: number): Promise<User> {
    return this.findOne({
      where: {
        id: userId,
      },
    });
  }

  async updatePairToken(userId: number, data: PairToken): Promise<User> {
    await this.createQueryBuilder()
      .update(User)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      .where('id = :userId', { userId })
      .execute();

    return this.getUserById(userId);
  }
}
