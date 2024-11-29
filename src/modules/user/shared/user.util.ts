import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { ApplicationException } from '@common/exception/application.exception';
import UserError from '../resources/error/error';

@Injectable()
export class UserUtilService {
  constructor(private readonly userRepository: UserRepository) {}

  async getExistedUserOrThrowException(userId: number) {
    const matchedUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!matchedUser) {
      throw new ApplicationException(UserError.USER_ERROR_0001);
    }

    return matchedUser;
  }
}
