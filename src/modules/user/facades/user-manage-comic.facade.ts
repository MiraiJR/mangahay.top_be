import { ComicRepository } from '@modules/comic/comic.repository';
import { ComicUtilService } from '@modules/comic/shared/comic.util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserManageComicFacade {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly comicUtilService: ComicUtilService,
  ) {}

  async comicManagedByUserId(userId: number, pagination: { page: number; size: number }) {
    const { page, size } = pagination;
    const comicIdsManaged = await this.comicUtilService.getListComicIdMangedByUserId(userId);

    const comicsManagedByUserId = await this.comicRepository.getComicByIdsOfUserId(
      userId,
      comicIdsManaged.slice((page - 1) * size, page * size),
    );

    return {
      total: comicIdsManaged.length,
      comics: comicsManagedByUserId,
    };
  }
}
