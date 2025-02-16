import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Chapter } from './chapter.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { customSlugify } from '@common/configs/slugify.config';
import { IChapter } from './chapter.interface';

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
    return this.createQueryBuilder('chapter')
      .where('chapter.id = :chapterId', { chapterId })
      .leftJoinAndSelect('chapter.images', 'images')
      .select(['chapter', 'images.relativePath', 'images.position', 'images.id'])
      .orderBy('images.position', 'ASC')
      .getOne();
  }

  updateChapterName(chapterId: number, newChapterName: string, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Chapter) : this;
    return repository.update(
      {
        id: chapterId,
      },
      {
        name: newChapterName,
        updatedAt: new Date(),
      },
    );
  }

  createNewChapter(chapter: IChapter, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Chapter) : this;

    return repository.save({
      ...chapter,
      slug: customSlugify(chapter.name),
    });
  }

  async getPaginationChapterIdsOfComic(comicId: number, paging: { page: number; size: number }) {
    const queryBuilder = this.createQueryBuilder('chapter')
      .select(['chapter.id'])
      .where('chapter.comic = :comicId', { comicId })
      .orderBy('chapter.order', 'DESC');

    if (paging) {
      const { page, size } = paging;
      queryBuilder.offset((page - 1) * size).limit(size);
    }

    return (await queryBuilder.getMany()).map((chapter) => chapter.id);
  }

  async getListChapterByComicId(
    comicId: number,
    paging: { page: number; size: number } = { page: 1, size: 20 },
    isGetAll: boolean = false,
  ) {
    let queryBuilder = this.createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.images', 'images')
      .leftJoinAndMapOne('chapter.creator', 'User', 'creator', 'creator.id = chapter.creatorId')
      .select([
        'chapter',
        'creator.id',
        'creator.fullname',
        'creator.avatar',
        'images.relativePath',
        'images.position',
        'images.id',
      ]);

    if (!isGetAll) {
      const chapterIds = await this.getPaginationChapterIdsOfComic(comicId, paging);
      if (chapterIds.length === 0) {
        return [];
      }

      queryBuilder = queryBuilder.where('chapter.id IN (:...chapterIds)', { chapterIds });
    }

    return queryBuilder
      .andWhere('chapter.comicId = :comicId', { comicId })
      .orderBy('chapter.order', 'DESC')
      .addOrderBy('images.position', 'ASC')
      .getMany();
  }

  countTotalChapterOfComic(comicId: number) {
    return this.count({
      where: {
        comicId,
      },
    });
  }

  getChapterWithImagesBySlug(slug: string) {
    return this.createQueryBuilder('chapter')
      .where('chapter.slug = :slug', { slug })
      .leftJoinAndSelect('chapter.images', 'images')
      .select(['chapter', 'images.relativePath', 'images.position', 'images.id'])
      .orderBy('images.position', 'ASC')
      .getOne();
  }

  getListChapterBelongToComic(comicId: number, chapterIds: number[]) {
    return this.createQueryBuilder('chapter')
      .where('chapter.comicId = :comicId', { comicId })
      .andWhere('chapter.id IN (:...chapterIds)', { chapterIds })
      .getMany();
  }

  async reorderListChapter(
    listReorderedChapter: { chapterId: number; newOrder: number }[],
    manager?: EntityManager,
  ) {
    const repository = manager ? manager.getRepository(Chapter) : this;

    for (const reorderedChapter of listReorderedChapter) {
      await repository.update(
        {
          id: reorderedChapter.chapterId,
        },
        {
          order: reorderedChapter.newOrder,
          updatedAt: new Date(),
        },
      );
    }
  }
}
