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

  async getChaptersOfComic(id_comic: any) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .select(['chapter.id', 'chapter.name', 'chapter.slug', 'chapter.updatedAt', 'chapter.images'])
      .where('chapter.id_comic = :id_comic', { id_comic })
      .orderBy('chapter.id', 'DESC')
      .getMany();
  }

  async getNewestChapter(id_comic: any) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.id_comic = :id_comic', { id_comic })
      .orderBy('chapter.updatedAt', 'ASC')
      .getOne();
  }

  getNextAndPreChapter(chapterId: number, chapters: Array<Chapter>) {
    let pre = null;
    let next = null;
    let cur = null;

    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].id === chapterId) {
        next = chapters[i - 1] ? chapters[i - 1] : null;
        cur = chapters[i];
        pre = chapters[i + 1] ? chapters[i + 1] : null;
      }
    }

    return {
      pre,
      cur,
      next,
    };
  }

  async create(chapter: IChapter) {
    const new_chapter = this.chapterRepository.create(chapter);
    return await this.chapterRepository.save(new_chapter);
  }

  async update(chapter: IChapter) {
    const update_chapter = this.chapterRepository.create(chapter);

    return await this.chapterRepository.save(update_chapter);
  }

  async delete(id_chapter: number) {
    return await this.chapterRepository.delete({
      id: id_chapter,
    });
  }

  async deleteAllChapterOfComic(id_comic: number) {
    return await this.chapterRepository
      .createQueryBuilder('chapters')
      .delete()
      .from(Chapter)
      .where('id_comic = :id_comic', { id_comic })
      .execute();
  }

  async getOne(id_chapter: number) {
    return await this.chapterRepository.findOne({
      where: {
        id: id_chapter,
      },
    });
  }

  async updateImages(id_chapter: number, images: string[]) {
    return await this.chapterRepository.save({
      id: id_chapter,
      images: images,
    });
  }

  async updateImagesAtSpecificPosition(id_chapter: number, positions: number[], images: string[]) {
    const chapter = await this.getOne(id_chapter);
    const chapter_images = chapter.images;

    for (const i in positions) {
      chapter_images[positions[i]] = images[i];
    }

    return await this.chapterRepository.save({
      id: id_chapter,
      images: chapter_images,
    });
  }
}
