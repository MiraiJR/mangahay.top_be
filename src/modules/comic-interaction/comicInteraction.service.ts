import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ComicInteraction } from './comicInteraction.entity';
import { ComicInteractionRepository } from './comicInteraction.repository';
import { DEFAULT_USER_INTERACTION } from './types/defaul';

@Injectable()
export class ComicInteractionService {
  constructor(private comicInteractionRepository: ComicInteractionRepository) {}
  async getInteractionOfWithComic(userId: number, comicId: number): Promise<ComicInteraction> {
    const interaction = await this.comicInteractionRepository.getInteractionByPK(userId, comicId);

    return interaction;
  }

  async calculateEvaluatedRatingStar(comicId: number): Promise<number> {
    const evaluations = await this.comicInteractionRepository.getInteractionsOfComic(comicId);

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

  async listUsersLikeComic(comicId: number) {
    const users = await this.comicInteractionRepository.find({
      where: {
        comic: { id: comicId },
      },
    });

    return users;
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

  async getListUserIdFollowedComic(comicId: number): Promise<number[]> {
    const objectUsers = await this.comicInteractionRepository.getUsersFollowedComic(comicId);
    const arrayUserId = objectUsers.map((objectUser) => objectUser.user.id);

    return arrayUserId;
  }

  async getFollowingComicOfUser(userId: number) {
    return this.comicInteractionRepository.listFollowingComicsOfUser(userId);
  }
}
