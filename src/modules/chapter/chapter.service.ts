import { Injectable } from '@nestjs/common';
import { Chapter } from './chapter.entity';
import { EntityManager } from 'typeorm';
import { IChapter } from './chapter.interface';
import { ChapterRepository } from './chapter.repository';
import { ApplicationException } from '@common/exception/application.exception';
import ChapterError from './resources/error/error';
import { ChapterUtilService } from './util/chapter.util';

@Injectable()
export class ChapterService {
  constructor(
    private chapterRepository: ChapterRepository,
    private readonly chapterUtil: ChapterUtilService,
  ) {}

  async checkChapterWithOrderExisted(comicId: number, orderChapter: number) {
    const matchedChapter = await this.chapterRepository.getChaperByOrder(comicId, orderChapter);

    if (matchedChapter) {
      throw new ApplicationException(ChapterError.CHAPTER_ERROR_0002);
    }
  }

  async getChapterById(chapterId: number) {
    const matchedChapter = await this.chapterRepository.getChapterById(chapterId);

    if (!matchedChapter) {
      throw new ApplicationException(ChapterError.CHAPTER_ERROR_0001);
    }

    return matchedChapter;
  }

  async reorderChapters() {
    const chapters = await this.chapterRepository.find();

    chapters.forEach(async (chapter) => {
      let order = 1;

      if (chapter.name.match(/[+-]?\d+(\.\d+)?/g)) {
        order = parseFloat(chapter.name.match(/[+-]?\d+(\.\d+)?/g)[0]);
      }

      await this.chapterRepository.save({
        ...chapter,
        order,
      });
    });
  }

  async getSpecificChapterOfComicWithPreviousAndNextChapter(comicId: number, chapterId: number) {
    const chapters = await this.chapterRepository.getListChapterByComicId(comicId);
    const indexOfCurrentChapter = chapters.findIndex((chapter) => chapter.id === chapterId);

    if (indexOfCurrentChapter === -1) {
      throw new ApplicationException(ChapterError.CHAPTER_ERROR_0001);
    }

    const nextChapter = chapters[indexOfCurrentChapter - 1]
      ? chapters[indexOfCurrentChapter - 1]
      : null;
    const currentChapter = chapters[indexOfCurrentChapter];
    const previousChapter = chapters[indexOfCurrentChapter + 1]
      ? chapters[indexOfCurrentChapter + 1]
      : null;

    return {
      previousChapter,
      nextChapter,
      currentChapter,
    };
  }

  async deleteById(chapterId: number) {
    return await this.chapterRepository.delete({
      id: chapterId,
    });
  }

  async getChapterBySlug(slug: string) {
    const matchedChapter = await this.chapterRepository.getChapterWithImagesBySlug(slug);

    if (!matchedChapter) {
      throw new ApplicationException(ChapterError.CHAPTER_ERROR_0001);
    }

    return this.chapterUtil.convertImagesOfChapterWithHostS3(matchedChapter);
  }
}
