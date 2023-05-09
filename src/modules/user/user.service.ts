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
  ) {}

  async create(user: IUser) {
    return await this.userRepository.save(user);
  }

  async getAll() {
    return await this.userRepository.find({
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

  async updateActive(email: any) {
    const user = await this.getUserByEmail(email);
    return await this.userRepository.save({
      ...user,
      active: true,
    });
  }

  async updatePassword(email: string, new_password: string) {
    // hash password
    const salt = await bcrypt.genSalt(10);
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

    for (let i = number_day; i >= 1; i--) {
      const temp_date = moment()
        .subtract(i, 'days')
        .startOf('day')
        .format('yyyy-MM-DD');

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
      const temp_date = moment()
        .subtract(i, 'days')
        .startOf('day')
        .format('yyyy-MM-DD');

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
    let percent_increment =
      (result[1].value - result[0].value) / result[0].value;

    percent_increment = percent_increment ? percent_increment * 100 : 0;

    return {
      increase: result[1].value - result[0].value,
      percent_increment: percent_increment,
      is_increase: percent_increment >= 0 ? true : false,
    };
  }
}
