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

  async getChaperByOrder(comicId: number, orderChapter: number): Promise<Chapter> {
    return this.findOne({
      where: {
        comicId,
        order: orderChapter,
      },
    });
  }
}
