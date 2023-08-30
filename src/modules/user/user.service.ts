/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User_Follow_Comic } from './user_follow/user_follow.entity';
import { User_Like_Comic } from './user_like/user-like.entity';
import { IUser } from './user.interface';
import { User_Evaluate_Comic } from './user_evaluate/user_evaluate.entity';
import * as moment from 'moment';
import { UserRole } from './user.role';
import { IHistory } from './user_history/history.interface';
import { UserHistory } from './user_history/user_history.entity';
import { SALT_HASH_PWD } from 'src/common/utils/salt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(User_Follow_Comic)
    private userFollowComicRepository: Repository<User_Follow_Comic>,
    @InjectRepository(User_Like_Comic)
    private userLikeComicRepository: Repository<User_Like_Comic>,
    @InjectRepository(User_Evaluate_Comic)
    private userEvaluateComicRepository: Repository<User_Evaluate_Comic>,
    @InjectRepository(UserHistory)
    private userHistoryRepository: Repository<UserHistory>,
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

  async updatePassword(email: string, new_password: string) {
    // hash password
    const salt = await SALT_HASH_PWD;
    const hash_password = await bcrypt.hash(new_password, salt);

    return await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hash_password })
      .where('email = :email', { email: email })
      .execute();
  }

  async followComic(id_user: number, id_comic: number) {
    return await this.userFollowComicRepository.save({
      id_user,
      id_comic,
    });
  }

  async likeComic(id_user: number, id_comic: number) {
    return await this.userLikeComicRepository.save({
      id_user,
      id_comic,
    });
  }

  async isFollowComic(id_user: number, id_comic: number) {
    return await this.userFollowComicRepository.findOne({
      where: {
        id_user: id_user,
        id_comic: id_comic,
      },
    });
  }

  async isLikeComic(id_user: number, id_comic: number) {
    return await this.userLikeComicRepository.findOne({
      where: {
        id_user: id_user,
        id_comic: id_comic,
      },
    });
  }

  async unfollowComic(id_user: number, id_comic: number) {
    return this.userFollowComicRepository.delete({
      id_user: id_user,
      id_comic: id_comic,
    });
  }

  async deleteComicFromFollow(id_comic: number) {
    return await this.userEvaluateComicRepository
      .createQueryBuilder('users_follow_comic')
      .delete()
      .from(User_Follow_Comic)
      .where('id_comic = :id_comic', { id_comic })
      .execute();
  }

  async deleteComicFromLike(id_comic: number) {
    return await this.userLikeComicRepository
      .createQueryBuilder('users_like_comic')
      .delete()
      .from(User_Like_Comic)
      .where('id_comic = :id_comic', { id_comic })
      .execute();
  }

  async deleteComicFromEvaluate(id_comic: number) {
    return await this.userEvaluateComicRepository
      .createQueryBuilder('users_evaluate_comic')
      .delete()
      .from(User_Evaluate_Comic)
      .where('id_comic = :id_comic', { id_comic })
      .execute();
  }

  async unlikeComic(id_user: number, id_comic: number) {
    return this.userLikeComicRepository.delete({
      id_user: id_user,
      id_comic: id_comic,
    });
  }

  async update(id_user: number, data_update: IUser) {
    return this.userRepository.save({
      id: id_user,
      ...data_update,
    });
  }

  async checkFollowing(id_user: number, id_comic: number) {
    return await this.userFollowComicRepository.findOne({
      where: {
        id_user: id_user,
        id_comic: id_comic,
      },
    });
  }

  async getListUserFollowingComic(id_comic: number) {
    return await this.userFollowComicRepository.find({
      where: {
        id_comic: id_comic,
      },
    });
  }

  async getFollowingComic(id_user: number, query: any) {
    return await this.userFollowComicRepository
      .createQueryBuilder('follow_comic')
      .leftJoinAndSelect('follow_comic.id_comic', 'comics')
      .where('follow_comic.id_user = :id_user', { id_user: id_user })
      .skip(parseInt(query.limit) * (parseInt(query.page) - 1))
      .limit(parseInt(query.limit))
      .getRawMany();
  }

  async getLikedComic(id_user: number, query: any) {
    return await this.userLikeComicRepository
      .createQueryBuilder('liked_comic')
      .leftJoinAndSelect('liked_comic.id_comic', 'comics')
      .where('liked_comic.id_user = :id_user', { id_user: id_user })
      .skip(parseInt(query.limit) * (parseInt(query.page) - 1))
      .limit(parseInt(query.limit))
      .getRawMany();
  }

  async isEvaluateComic(id_user: number, id_comic: number) {
    return await this.userEvaluateComicRepository.findOne({
      where: {
        id_user: id_user,
        id_comic: id_comic,
      },
    });
  }

  async evaluateComic(id_user: number, id_comic: number) {
    return await this.userEvaluateComicRepository.save({
      id_user,
      id_comic,
    });
  }

  async analysisDayAgo(number_day: number) {
    const analysis = await this.userRepository.manager.query(
      `select COUNT(id) as "count", DATE("createdAt")
      from public."user"
      where DATE("createdAt") between DATE('${moment()
        .subtract(number_day, 'days')
        .startOf('day')
        .format('yyyy-MM-DD')}') AND DATE('${moment().format('yyyy-MM-DD')}')
      group by DATE("createdAt")`,
    );

    const result = [];

    for (let i = number_day - 1; i >= 0; i--) {
      const temp_date = moment().subtract(i, 'days').startOf('day').format('yyyy-MM-DD');

      const check = analysis.filter(
        (ele: any) => moment(ele.date).format('yyyy-MM-DD') === temp_date,
      );

      if (check.length !== 0) {
        result.push({
          date: temp_date,
          value: parseInt(check[0].count),
        });
      } else {
        result.push({
          date: temp_date,
          value: 0,
        });
      }
    }

    return result;
  }

  async compareCurDateAndPreDate() {
    const analysis = await this.userRepository.manager.query(
      `select COUNT(id) as "count", DATE("createdAt")
      from public."user"
      where DATE("createdAt") between DATE('${moment()
        .subtract(1, 'days')
        .startOf('day')
        .format('yyyy-MM-DD')}') AND DATE('${moment().format('yyyy-MM-DD')}')
      group by DATE("createdAt")`,
    );

    const result = [];

    for (let i = 1; i >= 0; i--) {
      const temp_date = moment().subtract(i, 'days').startOf('day').format('yyyy-MM-DD');

      const check = analysis.filter(
        (ele: any) => moment(ele.date).format('yyyy-MM-DD') === temp_date,
      );

      if (check.length !== 0) {
        result.push({
          date: temp_date,
          value: parseInt(check[0].count),
        });
      } else {
        result.push({
          date: temp_date,
          value: 0,
        });
      }
    }

    let percent_increment = 0;

    if (result[0].value !== 0) {
      percent_increment = (result[1].value - result[0].value) / result[0].value;
    } else {
      if (result[1].value === 0) {
        percent_increment = 0;
      } else {
        percent_increment = 1;
      }
    }

    percent_increment = percent_increment ? percent_increment * 100 : 0;

    return {
      increase: result[1].value - result[0].value,
      percent_increment: percent_increment.toFixed(2),
      is_increase: percent_increment >= 0 ? true : false,
    };
  }

  async getHistory(id_user: number) {
    return this.userHistoryRepository.manager.query(
      `select comic_tb.id as "comic_id", comic_tb.name as "comic_name", comic_tb.thumb as "comic_thumb", comic_tb.slug as "comic_slug", comic_tb.star, comic_tb.view, comic_tb.like, comic_tb.follow, chapter_tb.name as "chapter_name", chapter_tb.slug as "chapter_slug", chapter_tb.id as "chapter_id"
      from public."user_history" uh_tb
      join public.comic comic_tb on uh_tb.id_comic = comic_tb.id
      join public.chapter chapter_tb on uh_tb.id_chapter = chapter_tb.id
      where uh_tb.id_user = ${id_user}
      order by uh_tb."readAt" DESC
      `,
    );
  }

  async addToHistory(history: IHistory) {
    const is_existed = await this.userHistoryRepository.findOne({
      where: {
        id_comic: history.id_comic,
        id_user: history.id_user,
      },
    });

    if (is_existed) {
      return await this.userHistoryRepository
        .createQueryBuilder()
        .update(UserHistory)
        .set({ id_chapter: history.id_chapter })
        .where('id_user = :id_user', { id_user: history.id_user })
        .andWhere('id_comic = :id_comic', { id_comic: history.id_comic })
        .execute();
    }

    return await this.userHistoryRepository.save(history);
  }

  async deleteHistory(delete_all: boolean, id_user: number, id_comic: number) {
    if (delete_all) {
      return await this.userHistoryRepository
        .createQueryBuilder()
        .delete()
        .from(UserHistory)
        .where('id_user = :id_user', { id_user: id_user })
        .execute();
    }

    return await this.userHistoryRepository
      .createQueryBuilder()
      .delete()
      .from(UserHistory)
      .where('id_user = :id_user', { id_user: id_user })
      .andWhere('id_comic = :id_comic', { id_comic: id_comic })
      .execute();
  }
}
