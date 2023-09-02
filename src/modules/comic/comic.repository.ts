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

  async getComicsAndNewtChapter(page: number, limit: number) {
    const queryBuilder = this.createQueryBuilder('comic')
      .leftJoinAndMapOne('comic.newestChapter', Chapter, 'chapter', 'chapter.id_comic = comic.id')
      .select(['comic'])
      .addSelect(['chapter.name', 'chapter.slug', 'chapter.id']);

    const comics = await queryBuilder
      .addOrderBy('comic.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return comics;
  }
}
