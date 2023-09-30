import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comic } from './comic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from '../chapter/chapter.entity';

@Injectable()
export class ComicRepository extends Repository<Comic> {
  constructor(
    @InjectRepository(Comic)
    repository: Repository<Comic>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getComicsAndNewesttChapter(page: number, limit: number, field: string) {
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
      .leftJoinAndMapMany('comic.chapters', Chapter, 'chapter', 'comic.id = chapter.comicId')
      .select(['comic'])
      .addSelect(['chapter.slug']);

    return queryBuilder.getMany();
  }
}
