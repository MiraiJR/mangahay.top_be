import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
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
    if (manager) {
      for (const [index, relativePathImage] of relativePathImages.entries()) {
        await manager.getRepository(ChapterImageEntity).save({
          relativePath: relativePathImage,
          position: index + 1,
          chapterId,
        });
      }
    } else {
      for (const [index, relativePathImage] of relativePathImages.entries()) {
        await this.save({
          relativePath: relativePathImage,
          position: index + 1,
          chapterId,
        });
      }
    }
  }
}
