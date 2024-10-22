import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { IUser } from './user.interface';
import { UserRole } from './user.role';
import { ComicService } from '../comic/comic.service';
import { ChapterViewType } from '../user-setting/enums/chapter-view-type';
import { UserRepository } from './user.repository';
import { S3Service } from '../../common/external-service/image-storage/s3.service';
import { hashPassword } from '@common/utils/password.util';
import { ComicInteractionService } from '@modules/comic/comic-interaction/comicInteraction.service';
import { ComicInteraction } from '@modules/comic/comic-interaction/comicInteraction.entity';
import { UserSessionRepository } from './user-sessions/user-session.repository';
import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { DataSource } from 'typeorm';
import { UserSettingEntity } from '@modules/user-setting/user-setting.entity';

@Injectable()
export class UserService {
  constructor(
    private comicService: ComicService,
    private comicInteractionService: ComicInteractionService,
    private userRepository: UserRepository,
    private s3Service: S3Service,
    private userSessionRepository: UserSessionRepository,
    private elasticsearchAdapter: ElasticsearchAdapterService,
    private databaseConnection: DataSource,
  ) {}

  create(user: IUser) {
    return this.databaseConnection.transaction(async (manager) => {
      const newUser = await manager.getRepository(User).save(user);
      this.elasticsearchAdapter.addRecord<User>('users', newUser);
      await manager.getRepository(UserSettingEntity).save({
        user: newUser,
        chapterSetting: {
          type: ChapterViewType.DEFAULT,
          amount: 1,
        },
      });

      return newUser;
    });
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
    return await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: await hashPassword(newRawPassword) })
      .where('email = :email', { email: email })
      .execute();
  }

  async interactWithComic(
    userId: number,
    comicId: number,
    interactionType: string,
  ): Promise<ComicInteraction> {
    switch (interactionType) {
      case 'like':
        await this.comicInteractionService.likeComic(userId, comicId);
        break;
      case 'unlike':
        await this.comicInteractionService.unlikeComic(userId, comicId);
        break;
      case 'follow':
        await this.comicInteractionService.followComic(userId, comicId);
        break;
      case 'unfollow':
        await this.comicInteractionService.unfollowComic(userId, comicId);
        break;
      default:
        throw new HttpException('Hành vi không hợp lệ!', HttpStatus.BAD_REQUEST);
    }

    return this.checkInteractionWithComic(userId, comicId);
  }

  async checkInteractionWithComic(userId: number, comicId: number): Promise<ComicInteraction> {
    const comic = await this.comicService.getComicById(comicId);
    let interaction = await this.comicInteractionService.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      interaction = {
        userId,
        comicId,
        isLiked: false,
        isFollowed: false,
        score: null,
      } as ComicInteraction;
    }

    return interaction;
  }

  async getFollowingComicOfUser(userId: number) {
    const followingComics = await this.comicInteractionService.getFollowingComicOfUser(userId);
    const comics = followingComics.map((followingComic: any) => followingComic.comic);

    return comics;
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { relativePath } = await this.s3Service.uploadFileFromBuffer(
      file.buffer,
      `users/avatar/${userId}`,
      `${userId}.jpeg`,
    );

    return this.userRepository.save({
      ...user,
      avatar: relativePath,
    });
  }

  async updateProfile(userId: number, fullname: string, phone: string) {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (fullname.length <= 2) {
      throw new HttpException('Tên quá ngắn tối thiểu 3 ký tự!', HttpStatus.BAD_REQUEST);
    }

    if (!phone || phone.trim() === '') {
      return this.userRepository.save({
        ...user,
        fullname,
      });
    }

    const regex = /^0\d{9}$/;
    if (!regex.test(phone)) {
      throw new HttpException('Số điện thoại không hợp lệ!', HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.save({
      ...user,
      fullname: fullname,
      phone: phone,
    });
  }

  async isExistedEmail(email: string) {
    const matchedUser = await this.getUserByEmail(email);
    return !!matchedUser;
  }
}
