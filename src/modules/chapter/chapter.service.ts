import { Injectable } from '@nestjs/common';
import { Chapter } from './chapter.entity';
import { EntityManager } from 'typeorm';
import { IChapter } from './chapter.interface';
import { ChapterRepository } from './chapter.repository';
import { ApplicationException } from '@common/exception/application.exception';
import ChapterError from './resources/error/error';

@Injectable()
export class ChapterService {
  constructor(private chapterRepository: ChapterRepository) {}

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

  async createNewChapterWithoutFiles(chapter: IChapter, manager?: EntityManager) {
    if (manager) {
      let newChapter = manager.getRepository(Chapter).create(chapter);
      newChapter = await manager.getRepository(Chapter).save(newChapter);
      newChapter = await manager.getRepository(Chapter).save({
        ...newChapter,
        slug: `${newChapter.slug}-${newChapter.id}`,
      });

      return newChapter;
    }

    let newChapter = this.chapterRepository.create(chapter);
    newChapter = await this.chapterRepository.save(newChapter);
    newChapter = await this.chapterRepository.save({
      ...newChapter,
      slug: `${newChapter.slug}-${newChapter.id}`,
    });

    return newChapter;
  }

  async update(chapter: IChapter, manager?: EntityManager) {
    const update_chapter = manager
      ? manager.getRepository(Chapter).create(chapter)
      : this.chapterRepository.create(chapter);

    return manager
      ? manager.getRepository(Chapter).save(update_chapter)
      : this.chapterRepository.save(update_chapter);
  }

  async delete(chapterId: number) {
    return await this.chapterRepository.delete({
      id: chapterId,
    });
  }

  async updateImages(chapterId: number, images: string[]) {
    return await this.chapterRepository.save({
      id: chapterId,
      images: images,
    });
  }

  async updateImagesAtSpecificPosition(chapterId: number, positions: number[], images: string[]) {
    const chapter = await this.chapterRepository.getChapterById(chapterId);
    const chapter_images = chapter.images;

    for (const i in positions) {
      chapter_images[positions[i]] = images[i];
    }

    return await this.chapterRepository.save({
      id: chapterId,
      images: chapter_images,
    });
  }

  async getChapterBySlug(slug: string) {
    const matchedChapter = await this.chapterRepository.findOne({
      where: {
        slug,
      },
    });

    if (!matchedChapter) {
      throw new ApplicationException(ChapterError.CHAPTER_ERROR_0001);
    }

    return matchedChapter;
  }
}
