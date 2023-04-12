import { Injectable } from '@nestjs/common';
import { Chapter } from './chapter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IChapter } from './chapter.interface';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
  ) {}

  async getAll(id_comic: any) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.id_comic = :id_comic', { id_comic })
      .orderBy('chapter.id', 'ASC')
      .getMany();
  }

  async getNewestChapter(id_comic: any) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.id_comic = :id_comic', { id_comic })
      .orderBy('chapter.id', 'ASC')
      .getOne();
  }

  async create(chapter: IChapter) {
    return await this.chapterRepository.save({
      ...chapter,
    });
  }

  async update(chapter: IChapter) {
    return await this.chapterRepository.save({
      id: chapter.id,
      ...chapter,
    });
  }

  async delete(id_chapter: number) {
    return await this.chapterRepository.delete({
      id: id_chapter,
    });
  }

  async getOne(id_chapter: number) {
    return await this.chapterRepository.findOne({
      where: {
        id: id_chapter,
      },
    });
  }
}
