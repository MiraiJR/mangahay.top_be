import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comic } from './comic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from '../chapter/chapter.entity';
import { PagingComics } from 'src/common/types/Paging';

@Injectable()
export class ComicRepository extends Repository<Comic> {
  constructor(
    @InjectRepository(Comic)
    repository: Repository<Comic>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getComicsWithPagination(page: number, limit: number, field: string): Promise<PagingComics> {
    let query = this.createQueryBuilder('comic');

    const totalRecord = await query.getCount();

    query = query
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .orderBy(`comic.${field}`, 'DESC')
      .addOrderBy(`chapters.order`, 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const comics = await query.getMany();

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

  updateThumb(comicId: number, thumb: string) {
    return this.update(
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

  getComicBySlug(slug: string) {
    return this.createQueryBuilder('comic')
      .where('comic.slug = :slug', { slug })
      .leftJoinAndSelect('comic.creator', 'user')
      .leftJoinAndSelect('comic.chapters', 'chapters')
      .select(['comic', 'user.id', 'user.fullname', 'chapters'])
      .getOne();
  }

  getComicById(id: number) {
    return this.findOne({
      where: {
        id,
      },
      order: {
        chapters: {
          order: 'DESC',
        },
      },
    });
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
}
