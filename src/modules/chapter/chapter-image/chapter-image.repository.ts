import { Injectable } from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { ChapterImageEntity } from './chapter-image.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChapterImageRepository extends Repository<ChapterImageEntity> {
  constructor(
    @InjectRepository(ChapterImageEntity)
    repository: Repository<ChapterImageEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async insertBulkImage(relativePathImages: string[], chapterId: number, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(ChapterImageEntity) : this;

    for (const [index, relativePathImage] of relativePathImages.entries()) {
      await repository.save({
        relativePath: relativePathImage,
        position: index + 1,
        chapterId,
      });
    }
  }

  async addMoreImageForExistedChapter(
    chapterId: number,
    relativePathImages: string[],
    manager?: EntityManager,
  ) {
    const repository = manager ? manager.getRepository(ChapterImageEntity) : this;
    const startPosition = (await this.getTheHighestPositionImageOfChapter(chapterId)) + 1;

    for (const [index, relativePathImage] of relativePathImages.entries()) {
      await repository.save({
        relativePath: relativePathImage,
        position: startPosition + index,
        chapterId,
      });
    }
  }

  deleteImageByIds(imageIds: number[], manager?: EntityManager) {
    const repository = manager ? manager.getRepository(ChapterImageEntity) : this;
    return repository.delete({ id: In(imageIds) });
  }

  async getTheHighestPositionImageOfChapter(chapterId: number) {
    const matchedChapterImage = await this.findOne({
      where: {
        chapterId,
      },
      order: {
        position: 'DESC',
      },
    });

    return matchedChapterImage.position;
  }
}
