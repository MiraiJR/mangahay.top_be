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
}
