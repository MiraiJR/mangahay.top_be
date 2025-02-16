import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Comic } from './comic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from '../chapter/chapter.entity';
import { PagingComics } from 'src/common/types/Paging';
import { ICreateComic } from './comic.interface';
import { IPagination } from '@common/interfaces/pagination';

@Injectable()
export class ComicRepository extends Repository<Comic> {
  constructor(
    @InjectRepository(Comic)
    repository: Repository<Comic>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  createRecord(data: ICreateComic, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Comic) : this;

    return repository.save({
      ...data,
    });
  }

  getAll() {
    return this.createQueryBuilder('comic')
      .leftJoinAndSelect('comic.creator', 'user')
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .select(['comic', 'user.id', 'user.fullname', 'chapters'])
      .getMany();
  }

  async getComicsRankingByField(
    field: string,
    order: 'ASC' | 'DESC' = 'DESC',
    paging?: IPagination,
  ): Promise<PagingComics> {
    const { page = 1, size = 20 } = paging;
    let queryBuilder = this.createQueryBuilder('comic');

    const totalRecord = await queryBuilder.getCount();

    queryBuilder = queryBuilder
      .distinctOn(['comic.id'])
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .orderBy('comic.id', order)
      .addOrderBy(`comic.${field}`, order)
      .addOrderBy(`chapters.order`, 'DESC')
      .offset((page - 1) * size)
      .limit(size);

    const comics = await queryBuilder.getMany();

    return {
      total: totalRecord,
      comics,
    };
  }

  async findComicsWithChapters() {
    const queryBuilder = this.createQueryBuilder('comic')
      .leftJoinAndMapMany('comic.chapters', Chapter, 'chapter', 'comic.id = chapter.comic')
      .select(['comic'])
      .addSelect(['chapter.slug']);

    return queryBuilder.getMany();
  }

  updateTimeForComic(comicId: number) {
    return this.createQueryBuilder()
      .update(Comic)
      .set({
        updatedAt: new Date(),
      })
      .where('id = :comicId', { comicId })
      .execute();
  }

  updateThumb(comicId: number, thumb: string, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Comic) : this;

    return repository.update(
      {
        id: comicId,
      },
      {
        thumb,
      },
    );
  }

  async getComicsByCreator(creatorId: number) {
    const comics = await this.createQueryBuilder('comic')
      .where('comic.creatorId = :creatorId', { creatorId })
      .leftJoinAndSelect('comic.creator', 'user')
      .leftJoinAndSelect(
        'comic.privileges',
        'privileges',
        'comic.id = privileges.comicId and privileges.userId = :creatorId',
        { creatorId },
      )
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .select(['comic', 'user.id', 'user.fullname', 'chapters', 'privileges.permissions'])
      .orderBy('comic.createdAt', 'DESC')
      .getMany();

    return comics.map((comic) => ({
      ...comic,
      privileges: comic.privileges.map((privilege) => privilege.permissions).flat(),
    }));
  }

  async getComicIdsByCreator(creatorId: number) {
    const comics = await this.find({
      where: {
        creatorId,
      },
    });

    return comics.map((comic) => comic.id);
  }

  getComicBySlug(slug: string) {
    return this.createQueryBuilder('comic')
      .where('comic.slug = :slug', { slug })
      .leftJoinAndSelect('comic.creator', 'user')
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .select(['comic', 'user.id', 'user.fullname', 'chapters'])
      .getOne();
  }

  getComicById(id: number, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Comic) : this;

    return repository
      .createQueryBuilder('comic')
      .where('comic.id = :id', { id })
      .leftJoinAndSelect('comic.creator', 'user')
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .select(['comic', 'user.id', 'user.fullname', 'chapters'])
      .addOrderBy('chapters.order', 'DESC')
      .getOne();
  }

  increamentView(id: number) {
    return this.increment(
      {
        id,
      },
      'view',
      1,
    );
  }

  async getComicByIdsOfUserId(userId: number, comicIds: number[]) {
    if (comicIds.length === 0) {
      return [];
    }

    const comics = await this.createQueryBuilder('comic')
      .where('comic.id IN (:...comicIds)', { comicIds })
      .leftJoinAndSelect('comic.creator', 'user')
      .leftJoinAndSelect(
        'comic.privileges',
        'privileges',
        'comic.id = privileges.comicId and privileges.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .select(['comic', 'user.id', 'user.fullname', 'chapters', 'privileges.permissions'])
      .orderBy('comic.createdAt', 'DESC')
      .getMany();

    return comics.map((comic) => ({
      ...comic,
      privileges: (comic.privileges || []).map((privilege) => privilege.permissions).flat(),
    }));
  }

  async getComicByIds(comicIds: number[], includedChapter: boolean = false) {
    let queryBuilder = this.createQueryBuilder('comic')
      .where('comic.id IN (:...comicIds)', {
        comicIds,
      })
      .orderBy('comic.id', 'DESC');

    if (includedChapter) {
      queryBuilder = queryBuilder
        .leftJoinAndMapMany('comic.chapters', 'comic.chapters', 'chapter')
        .select(['comic', 'chapter.id', 'chapter'])
        .addOrderBy('chapter.order', 'DESC');
    }

    return queryBuilder.getMany();
  }
}
