import { Injectable } from '@nestjs/common';
import { ComicInteraction } from './comicInteraction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comic } from '../comic.entity';

@Injectable()
export class ComicInteractionRepository extends Repository<ComicInteraction> {
  constructor(
    @InjectRepository(ComicInteraction)
    repository: Repository<ComicInteraction>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getInteractionsOfComic(comicId: number): Promise<ComicInteraction[]> {
    return this.createQueryBuilder('interaction')
      .andWhere('interaction.comic = :comicId', { comicId })
      .getMany();
  }

  async evaluatedComic(userId: number, comicId: number) {
    return this.createQueryBuilder('interaction')
      .where('interaction.user = :userId', { userId })
      .andWhere('interaction.comic = :comicId', { comicId })
      .andWhere('interaction.score <> :nullValue', { nullValue: null })
      .getOne();
  }

  async getUsersFollowedComic(comicId: number) {
    return this.createQueryBuilder('interaction')
      .where('interaction.comic = :comicId', { comicId })
      .andWhere('interaction.isFollowed = true')
      .select(['interaction.user'])
      .getMany();
  }

  async listFollowingComicsOfUser(userId: number) {
    const queryBuilder = this.createQueryBuilder('interaction')
      .where('interaction.user = :userId', { userId })
      .andWhere('interaction.isFollowed = true')
      .leftJoinAndMapOne('interaction.comic', Comic, 'comic', 'interaction.comic = comic.id')
      .select(['interaction', 'comic'])
      .orderBy('comic.updatedAt', 'DESC');

    const interaction = queryBuilder.getMany();
    return interaction;
  }

  async getInteractionByPK(userId: number, comicId: number): Promise<ComicInteraction> {
    return this.createQueryBuilder('interaction')
      .where('interaction.user = :userId', { userId })
      .andWhere('interaction.comic = :comicId', { comicId })
      .getOne();
  }

  async updateInteractionByPK(
    userId: number,
    comicId: number,
    userInteraction: UserInteraction,
  ): Promise<ComicInteraction> {
    await this.createQueryBuilder()
      .update(ComicInteraction)
      .set(userInteraction)
      .where('user = :userId', { userId })
      .andWhere('comic = :comicId', { comicId })
      .execute();

    return this.getInteractionByPK(userId, comicId);
  }

  async createNewInteraction(
    userId: number,
    comicId: number,
    userInteraction: UserInteraction,
  ): Promise<ComicInteraction> {
    await this.save({
      userId,
      comicId,
      ...userInteraction,
    });

    return this.getInteractionByPK(userId, comicId);
  }

  async countLikeOfComic(comicId: number) {
    return this.countBy({
      comicId,
      isLiked: true,
    });
  }

  async countFollowOfComic(comicId: number) {
    return this.countBy({
      comicId,
      isFollowed: true,
    });
  }
}
