import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Chapter } from './chapter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IChapter } from './chapter.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ChapterService {
  constructor(
    private cloudinaryService: CloudinaryService,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
  ) {}

  async getChaptersOfComic(comicId: number) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .select(['chapter.id', 'chapter.name', 'chapter.slug', 'chapter.updatedAt', 'chapter.images'])
      .where('chapter.comicId = :comicId', { comicId })
      .orderBy('chapter.id', 'DESC')
      .getMany();
  }

  async getNewestChapter(comicId: any) {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .where('chapter.comicId = :comicId', { comicId })
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

    if (cur === null) {
      throw new HttpException('Chapter không tồn tại!', HttpStatus.NOT_FOUND);
    }

    return {
      pre,
      cur,
      next,
    };
  }

  async createNewChapter(chapter: IChapter, files: Express.Multer.File[]) {
    let newChapter = this.chapterRepository.create(chapter);
    newChapter = await this.chapterRepository.save(newChapter);
    newChapter = await this.chapterRepository.save({
      ...newChapter,
      slug: `${newChapter}-${newChapter.id}`,
    });

    this.cloudinaryService
      .uploadMultipleFile(files, `comics/${newChapter.comicId}/${newChapter.id}`)
      .then((data) => this.updateImages(newChapter.id, data));

    return newChapter;
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
