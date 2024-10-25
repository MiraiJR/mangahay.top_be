import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chapter } from './chapter.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChapterRepository extends Repository<Chapter> {
  constructor(
    @InjectRepository(Chapter)
    repository: Repository<Chapter>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getChaperByOrder(comicId: number, orderChapter: number): Promise<Chapter> {
    return this.findOne({
      where: {
        comicId,
        order: orderChapter,
      },
    });
  }

  getChapterById(chapterId: number) {
    return this.findOne({
      where: {
        id: chapterId,
      },
    });
  }

  getListChapterByComicId(comicId: number) {
    return this.createQueryBuilder('chapter')
      .select([
        'chapter.id',
        'chapter.name',
        'chapter.slug',
        'chapter.updatedAt',
        'chapter.images',
        'chapter.order',
      ])
      .where('chapter.comic = :comicId', { comicId })
      .orderBy('chapter.order', 'DESC')
      .getMany();
  }
}
