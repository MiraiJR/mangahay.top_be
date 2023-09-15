import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { IUser } from './user.interface';
import { UserRole } from './user.role';
import { SALT_HASH_PWD } from 'src/common/utils/salt';
import { ComicInteractionService } from '../comic-interaction/comicInteraction.service';
import { ComicInteraction } from '../comic-interaction/comicInteraction.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private redisService: RedisService,
    private comicInteractionService: ComicInteractionService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: IUser) {
    return await this.userRepository.save(user);
  }

  async getAll() {
    return await this.userRepository.find({
      where: {
        role: UserRole.VIEWER || UserRole.TRANSLATOR,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getUserByPhone(phone: string) {
    return await this.userRepository.findOne({
      where: {
        phone,
      },
    });
  }

  async getUserById(id: any) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async updateActive(id_user: number, active: boolean) {
    const user = await this.getUserById(id_user);
    return await this.userRepository.save({
      ...user,
      active: active,
    });
  }

  async updatePassword(email: string, newRawPassword: string) {
    const salt = await SALT_HASH_PWD;
    const hashedPassword = await bcrypt.hash(newRawPassword, salt);

    return await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where('email = :email', { email: email })
      .execute();
  }

  async update(id_user: number, data_update: IUser) {
    return this.userRepository.save({
      id: id_user,
      ...data_update,
    });
  }

  async interactWithComic(
    userId: number,
    comicId: number,
    interactionType: string,
  ): Promise<string> {
    switch (interactionType) {
      case 'like':
        await this.comicInteractionService.likeComic(userId, comicId);

        return 'Đã thêm vào danh sách yêu thích!';
      case 'unlike':
        await this.comicInteractionService.unlikeComic(userId, comicId);

        return 'Đã loại khỏi danh sách yêu thích!';
      case 'follow':
        await this.comicInteractionService.followComic(userId, comicId);

        return 'Đã thêm vào danh sách theo dõi!';
      case 'unfollow':
        await this.comicInteractionService.unfollowComic(userId, comicId);

        return 'Đã loại khỏi danh sách theo dõi!';
      default:
        throw new HttpException('Hành vi không hợp lệ!', HttpStatus.BAD_REQUEST);
    }
  }

  async checkInteractionWithComic(userId: number, comicId: number): Promise<ComicInteraction> {
    let interaction = await this.comicInteractionService.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      interaction = {
        userId: userId,
        comicId: comicId,
        isLiked: false,
        isFollowed: false,
        score: null,
      };
    }

    return interaction;
  }

  async getFollowingComicOfUser(userId: number, query: Paging) {
    const followingComics = await this.comicInteractionService.getFollowingComicOfUser(
      userId,
      query,
    );
    const comics = followingComics.map((followingComic: any) => followingComic.comic);

    return comics;
  }
}
