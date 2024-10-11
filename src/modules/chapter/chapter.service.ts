import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Chapter } from './chapter.entity';
import { EntityManager } from 'typeorm';
import { IChapter } from './chapter.interface';
import { ChapterRepository } from './chapter.repository';
import { S3Service } from '../image-storage/s3.service';

@Injectable()
export class ChapterService {
  constructor(private chapterRepository: ChapterRepository, private s3Service: S3Service) {}

  async checkChapterWithOrderExisted(comicId: number, orderChapter: number): Promise<boolean> {
    const matchedChapter = await this.chapterRepository.getChaperByOrder(comicId, orderChapter);
    return !!matchedChapter;
  }

  async getChapters() {
    return this.chapterRepository.find({
      select: {
        slug: true,
      },
    });
  }

  async getChapter(chapterId: number) {
    return this.chapterRepository.findOne({
      where: {
        id: chapterId,
      },
    });
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

  async getChaptersOfComic(comicId: number) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
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

  getNextAndPreChapter(chapterId: number, chapters: Array<Chapter>) {
    let previousChapter = null;
    let nextChapter = null;
    let currentChapter = null;

    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].id === chapterId) {
        nextChapter = chapters[i - 1] ? chapters[i - 1] : null;
        currentChapter = chapters[i];
        previousChapter = chapters[i + 1] ? chapters[i + 1] : null;
      }
    }

    if (currentChapter === null) {
      throw new HttpException('Chapter không tồn tại!', HttpStatus.NOT_FOUND);
    }

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

  async createNewChapter(chapter: IChapter, files: Express.Multer.File[]) {
    let newChapter = this.chapterRepository.create(chapter);
    newChapter = await this.chapterRepository.save(newChapter);
    newChapter = await this.chapterRepository.save({
      ...newChapter,
      slug: `${newChapter.slug}-${newChapter.id}`,
      images: [],
    });

    this.s3Service
      .uploadMultipleFile(files, `comics/${newChapter.comicId}/${newChapter.id}`)
      .then((uploadedFiles) =>
        this.updateImages(
          newChapter.id,
          uploadedFiles.map((uploadedFile) => uploadedFile.relativePath),
        ),
      );

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

  async delete(id_chapter: number) {
    return await this.chapterRepository.delete({
      id: id_chapter,
    });
  }

  async deleteAllChapterOfComic(comicId: number) {
    return await this.chapterRepository
      .createQueryBuilder('chapters')
      .delete()
      .from(Chapter)
      .where('comicId = :comicId', { comicId })
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
