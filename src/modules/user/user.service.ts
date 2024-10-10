import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { IUser } from './user.interface';
import { UserRole } from './user.role';
import { SALT_HASH_PWD } from 'src/common/utils/salt';
import { ComicInteractionService } from '../comic-interaction/comicInteraction.service';
import { ComicInteraction } from '../comic-interaction/comicInteraction.entity';
import { ComicService } from '../comic/comic.service';
import { UserSettingRepository } from '../user-setting/user-setting.repository';
import { ChapterViewType } from '../user-setting/enums/chapter-view-type';
import { UserRepository } from './user.repository';
import { S3Service } from '../image-storage/s3.service';

@Injectable()
export class UserService {
  constructor(
    private comicService: ComicService,
    private comicInteractionService: ComicInteractionService,
    private userRepository: UserRepository,
    private userSettingRepository: UserSettingRepository,
    private s3Service: S3Service,
  ) {}

  async create(user: IUser) {
    const newUser = await this.userRepository.save(user);
    await this.userSettingRepository.insert({
      user: newUser,
      chapterSetting: {
        type: ChapterViewType.DEFAULT,
        amount: 1,
      },
    });

    return newUser;
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

  async interactWithComic(
    userId: number,
    comicId: number,
    interactionType: string,
  ): Promise<ComicInteraction> {
    switch (interactionType) {
      case 'like':
        await Promise.all([
          await this.comicInteractionService.likeComic(userId, comicId),
          await this.comicService.increaseTheNumberViewOrFollowOrLike(comicId, 'like', 1),
        ]);

        break;
      case 'unlike':
        await Promise.all([
          await this.comicInteractionService.unlikeComic(userId, comicId),
          await this.comicService.increaseTheNumberViewOrFollowOrLike(comicId, 'like', -1),
        ]);

        break;
      case 'follow':
        await Promise.all([
          await this.comicInteractionService.followComic(userId, comicId),
          await this.comicService.increaseTheNumberViewOrFollowOrLike(comicId, 'follow', 1),
        ]);

        break;
      case 'unfollow':
        await Promise.all([
          await this.comicInteractionService.unfollowComic(userId, comicId),
          await this.comicService.increaseTheNumberViewOrFollowOrLike(comicId, 'follow', -1),
        ]);

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
        user: await this.getUserById(userId),
        comic: comic,
        isLiked: false,
        isFollowed: false,
        score: null,
      };
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

    const imageUrl: string = await this.s3Service.uploadFileFromBuffer(
      file.buffer,
      `users/avatar/${userId}`,
      `${userId}.jpeg`,
    );

    return this.userRepository.save({
      ...user,
      avatar: imageUrl,
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
}
