import { Injectable } from '@nestjs/common';
import { ComicInteraction } from './comicInteraction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comic } from '../comic/comic.entity';

@Injectable()
export class ComicInteractionRepository extends Repository<ComicInteraction> {
  constructor(
    @InjectRepository(ComicInteraction)
    repository: Repository<ComicInteraction>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async evaluatedComic(userId: number, comicId: number) {
    return this.createQueryBuilder('interaction')
      .where('interaction.userId = :userId', { userId })
      .andWhere('interaction.comicId = :comicId', { comicId })
      .andWhere('interaction.score <> :nullValue', { nullValue: null })
      .getOne();
  }

  async getUsersFollowedComic(comicId: number) {
    return this.createQueryBuilder('interaction')
      .where('interaction.comicId = :comicId', { comicId })
      .andWhere('interaction.isFollowed = true')
      .select(['interaction.userId'])
      .getMany();
  }

  async listFollowingComicsOfUser(userId: number) {
    const queryBuilder = await this.createQueryBuilder('interaction')
      .where('interaction.userId = :userId', { userId })
      .andWhere('interaction.isFollowed = true')
      .leftJoinAndMapOne('interaction.comic', Comic, 'comic', 'interaction.comicId = comic.id')
      .select(['interaction', 'comic'])
      .orderBy('comic.updatedAt', 'DESC');

    const interaction = queryBuilder.getMany();
    return interaction;
  }
}
