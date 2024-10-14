import { HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comic } from './comic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from '../chapter/chapter.entity';
import StringUtil from 'src/common/utils/StringUtil';
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

  async searchComics(query: QuerySearch): Promise<PagingComics> {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    const result = this.createQueryBuilder('comics').leftJoinAndSelect(
      'comics.chapters',
      'chapters',
    );

    if (query.comicName) {
      result.where(
        `to_tsvector(comics.name || ' ' || comics.briefDescription || ' ' || comics.anotherName || ' ' || comics.slug) @@ plainto_tsquery(unaccent(:searchTerm))`,
        {
          searchTerm: `%${query.comicName}%`,
        },
      );
      result.orWhere(
        `REGEXP_REPLACE(LOWER(unaccent(comics.name)), '[^a-zA-Z0-9\s]', ' ', 'g') LIKE :comicName`,
        {
          comicName: `%${StringUtil.removeAccents(query.comicName)}%`,
        },
      );
    }

    if (query.filterState) {
      result.andWhere('comics.state = :state', { state: query.filterState });
    }

    if (query.filterSort) {
      switch (query.filterSort) {
        case 'az':
          result.orderBy('comics.name', 'ASC');
          break;
        case 'za':
          result.orderBy('comics.name', 'DESC');
          break;
        default:
          result.orderBy(`comics.${query.filterSort}`, 'DESC');
          break;
      }
    }

    if (query.filterAuthor) {
      result.where(
        `to_tsvector(array_to_string(comics.authors, ' ')) @@ plainto_tsquery(unaccent(:searchTerm))`,
        {
          searchTerm: `%${query.filterAuthor}%`,
        },
      );
      result.orWhere(
        `REGEXP_REPLACE(LOWER(unaccent(array_to_string(comics.authors, ' '))), '[^a-zA-Z0-9\s]', ' ', 'g') LIKE :comicName`,
        {
          comicName: `%${StringUtil.removeAccents(query.filterAuthor)}%`,
        },
      );
    }

    if (query.filterGenres) {
      result.where(
        `to_tsvector(array_to_string(comics.genres, ' ')) @@ plainto_tsquery(unaccent(:searchTerm))`,
        {
          searchTerm: `%${query.filterGenres.join(' ')}%`,
        },
      );
    }

    result.addOrderBy('comics.updatedAt', 'DESC');
    result.addOrderBy('chapters.order', 'DESC');

    const totalRecord = await result.getCount();
    let comics = await result.getMany();

    if (query.limit) {
      comics = comics.slice((page - 1) * query.limit, page * query.limit);
    }

    return {
      total: totalRecord,
      comics,
    };
  }

  async updateTimeForComic(comicId: number): Promise<void> {
    await this.createQueryBuilder()
      .update(Comic)
      .set({
        updatedAt: new Date(),
      })
      .where('id = :comicId', { comicId })
      .execute();
  }

  async getComicsByCreator(creatorId: number): Promise<Comic[]> {
    return this.createQueryBuilder('comics')
      .where('comics.creator = :creatorId', { creatorId })
      .orderBy('comics.updatedAt', 'ASC')
      .addOrderBy('comics.id', 'ASC')
      .getMany();
  }
}
