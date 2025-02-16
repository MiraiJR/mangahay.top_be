import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ComicInteraction } from './comic-interaction.entity';
import { ComicInteractionRepository } from './comic-interaction.repository';
import { ComicRepository } from '../comic.repository';
import { DEFAULT_USER_INTERACTION } from './constant';

@Injectable()
export class ComicInteractionService {
  constructor(
    private readonly comicInteractionRepository: ComicInteractionRepository,
    private readonly comicRepository: ComicRepository,
  ) {}
  async getInteractionOfWithComic(userId: number, comicId: number): Promise<ComicInteraction> {
    const interaction = await this.comicInteractionRepository.getInteractionByPK(userId, comicId);

    return interaction;
  }

  async calculateEvaluatedRatingStar(comicId: number): Promise<number> {
    let evaluations = await this.comicInteractionRepository.getInteractionsOfComic(comicId);
    evaluations = evaluations.filter((evaluation) => !!evaluation.score);

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
      return await this.comicInteractionRepository.createNewInteraction(userId, comicId, {
        ...DEFAULT_USER_INTERACTION,
        score,
      });
    }

    if (interaction.score) {
      throw new HttpException('Bạn đã đánh giá truyện này rồi!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.updateInteractionByPK(userId, comicId, {
      isFollowed: interaction.isFollowed,
      isLiked: interaction.isLiked,
      score: score,
    });
  }

  //------------> like comic
  async likeComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      return await this.comicInteractionRepository.createNewInteraction(userId, comicId, {
        ...DEFAULT_USER_INTERACTION,
        isLiked: true,
      });
    }

    if (interaction.isLiked) {
      throw new HttpException('Bạn đã thích truyện này rồi!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.updateInteractionByPK(userId, comicId, {
      isFollowed: interaction.isFollowed,
      isLiked: true,
      score: interaction.score,
    });
  }

  async unlikeComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      throw new HttpException('Bạn chưa bao giờ thích truyện này!', HttpStatus.BAD_REQUEST);
    }

    if (!interaction.isLiked) {
      throw new HttpException('Bạn chưa bao giờ thích truyện này!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.updateInteractionByPK(userId, comicId, {
      isFollowed: interaction.isFollowed,
      isLiked: false,
      score: interaction.score,
    });
  }

  async followComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      return await this.comicInteractionRepository.createNewInteraction(userId, comicId, {
        ...DEFAULT_USER_INTERACTION,
        isFollowed: true,
      });
    }

    if (interaction.isFollowed) {
      throw new HttpException('Bạn đã theo dõi truyện này rồi!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.updateInteractionByPK(userId, comicId, {
      isFollowed: true,
      isLiked: interaction.isLiked,
      score: interaction.score,
    });
  }

  async unfollowComic(userId: number, comicId: number) {
    const interaction = await this.getInteractionOfWithComic(userId, comicId);

    if (!interaction) {
      throw new HttpException('Bạn chưa bao theo dõi truyện này!', HttpStatus.BAD_REQUEST);
    }

    if (!interaction.isFollowed) {
      throw new HttpException('Bạn chưa bao theo dõi truyện này!', HttpStatus.BAD_REQUEST);
    }

    return this.comicInteractionRepository.updateInteractionByPK(userId, comicId, {
      isFollowed: false,
      isLiked: interaction.isLiked,
      score: interaction.score,
    });
  }

  getListUserIdFollowedComic(comicId: number): Promise<number[]> {
    return this.comicInteractionRepository.getUsersFollowedComic(comicId);
  }

  async getListFollowingComicOfUser(userId: number) {
    const followingComicIds = await this.comicInteractionRepository.listFollowingComicId(userId);
    const comics = await this.comicRepository.getComicByIds(followingComicIds, true);

    return comics;
  }
}
