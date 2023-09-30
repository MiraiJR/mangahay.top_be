import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ComicInteraction } from './comicInteraction.entity';
import { ComicInteractionRepository } from './comicInteraction.repository';

@Injectable()
export class ComicInteractionService {
  constructor(private comicInteractionRepository: ComicInteractionRepository) {}
  async getInteractionOfWithComic(userId: number, comicId: number): Promise<ComicInteraction> {
    const interaction = await this.comicInteractionRepository.findOne({
      where: {
        userId,
        comicId,
      },
    });

    return interaction;
  }

  //------------> evaluate comic
  async calculateEvaluatedRatingStar(comicId: number): Promise<number> {
    const evaluations = await this.comicInteractionRepository.find({
      where: {
        comicId,
      },
    });

    if (evaluations.length === 0) return 0;

    const sumOfScoreRating = evaluations.reduce(
      (previousSum, evaluation) => previousSum + evaluation.score,
      0,
    );

    return sumOfScoreRating / evaluations.length;
  }

  async evaluateComic(userId: number, comicId: number, score: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      return await this.comicInteractionRepository.save({
        userId,
        comicId,
        score,
      });
    }

    if (interaction.score) {
      throw new HttpException('Bạn đã đánh giá truyện này rồi!', HttpStatus.BAD_REQUEST);
    }

    return await this.comicInteractionRepository.save({
      ...interaction,
      score,
    });
  }

  //------------> like comic
  async likeComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      return await this.comicInteractionRepository.save({
        userId,
        comicId,
        isLiked: true,
      });
    }

    if (interaction.isLiked) {
      throw new HttpException('Bạn đã thích truyện này rồi!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.update(
      {
        userId,
        comicId,
      },
      {
        isLiked: true,
      },
    );
  }

  async unlikeComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      throw new HttpException('Bạn chưa bao giờ thích truyện này!', HttpStatus.BAD_REQUEST);
    }

    if (!interaction.isLiked) {
      throw new HttpException('Bạn chưa bao giờ thích truyện này!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.update(
      {
        userId,
        comicId,
      },
      {
        isLiked: false,
      },
    );
  }

  async listUsersLikeComic(comicId: number) {
    const users = await this.comicInteractionRepository.find({
      where: {
        comicId,
      },
    });

    return users;
  }

  //------------> follơ comic
  async followComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      return await this.comicInteractionRepository.save({
        userId,
        comicId,
        isFollowed: true,
      });
    }

    if (interaction.isFollowed) {
      throw new HttpException('Bạn đã theo dõi truyện này rồi!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.update(
      {
        userId,
        comicId,
      },
      {
        isFollowed: true,
      },
    );
  }

  async unfollowComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      throw new HttpException('Bạn chưa bao theo dõi truyện này!', HttpStatus.BAD_REQUEST);
    }

    if (!interaction.isFollowed) {
      throw new HttpException('Bạn chưa bao theo dõi truyện này!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.update(
      {
        userId,
        comicId,
      },
      {
        isFollowed: false,
      },
    );
  }

  async getListUserIdFollowedComic(comicId: number): Promise<number[]> {
    const objectUsers = await this.comicInteractionRepository.getUsersFollowedComic(comicId);
    const arrayUserId = objectUsers.map((objectUser) => objectUser.userId);

    return arrayUserId;
  }

  async getFollowingComicOfUser(userId: number) {
    return this.comicInteractionRepository.listFollowingComicsOfUser(userId);
  }
}
