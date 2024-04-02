import { HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comic } from './comic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from '../chapter/chapter.entity';
import StringUtil from 'src/common/utils/StringUtil';

@Injectable()
export class ComicRepository extends Repository<Comic> {
  constructor(
    @InjectRepository(Comic)
    repository: Repository<Comic>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getComicsAndNewesttChapter(page: number, limit: number, field: string) {
    if (Number.isNaN(limit)) {
      throw new Error('Không hợp lệ');
    }

    const arrayField = ['view', 'follow', 'star', 'createdAt', 'updatedAt'];
    if (!arrayField.includes(field)) {
      throw new Error('Không hợp lệ');
    }

    let comics: any[] = await this.manager.query(
      `
      select 
      truyen.id,
      truyen.slug,
      truyen.name,
      truyen.another_name as "anotherName",
      truyen.genres,
      truyen.authors,
      truyen.state,
      truyen.thumb,
      truyen.brief_description as "briefDescription",
      truyen.view,
      truyen.like,
      truyen.follow,
      truyen.star,
      truyen.creator,
      truyen."createdAt",
      truyen."updatedAt", 
      truyen.translators,
      chuong.id as newestchapterid,
      chuong.name as newestchaptername,
      chuong.slug as newestchapterslug
      from public.comic truyen left join (
      select tempChuong.comic_id, max(tempChuong.order) as max_order
      from public.chapter tempChuong
      group by tempChuong.comic_id
      ) maxUpdatedAt on truyen.id = maxUpdatedAt.comic_id left join public.chapter chuong on chuong.comic_id = truyen.id
      where chuong.order = maxUpdatedAt.max_order
      order by truyen."${field}" DESC
      offset ${(page - 1) * limit}
      limit ${limit}
      `,
    );

    comics = comics.map((comic) => {
      const refactor = {
        ...comic,
        newestChapter: {
          id: comic.newestchapterid,
          name: comic.newestchaptername,
          slug: comic.newestchapterslug,
        },
      };

      delete refactor.newestchapterid;
      delete refactor.newestchaptername;
      delete refactor.newestchapterslug;

      return refactor;
    });

    return comics;
  }

  async findComicsWithChapters() {
    const queryBuilder = this.createQueryBuilder('comic')
      .leftJoinAndMapMany('comic.chapters', Chapter, 'chapter', 'comic.id = chapter.comic')
      .select(['comic'])
      .addSelect(['chapter.slug']);

    return queryBuilder.getMany();
  }

  async searchComics(query: QuerySearch) {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    const result = this.createQueryBuilder().from(Comic, 'comics');

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

    result
      .addOrderBy('comics.updatedAt', 'DESC')
      .leftJoinAndMapOne('comics.newestChapter', Chapter, 'chapter', 'chapter.comic = comics.id')
      .select(['comics'])
      .addSelect(['chapter.name', 'chapter.slug', 'chapter.id']);

    const totalRecord = await result.getCount();

    if (query.limit) {
      result.skip((page - 1) * query.limit).take(query.limit);
    }

    const comics = await result.getMany();

    return {
      total: totalRecord,
      comics,
    };
  }
}
