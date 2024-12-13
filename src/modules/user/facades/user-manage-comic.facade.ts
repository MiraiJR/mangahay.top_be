import { ComicPrivilegeRepository } from '@modules/comic/comic-privilege/comic-privilege.repository';
import { ComicRepository } from '@modules/comic/comic.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserManageComicFacade {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly comicPrivilegeRepository: ComicPrivilegeRepository,
  ) {}

  async comicManagedByUserId(userId: number, pagination: { page: number; size: number }) {
    const { page, size } = pagination;
    const comicIdsCreated = await this.comicRepository.getComicIdsByCreator(userId);
    const comicIdsCanAccess = await this.comicPrivilegeRepository.getComicIdsManagedByUserId(
      userId,
    );

    const comicIdsManaged = [...new Set([...comicIdsCreated, ...comicIdsCanAccess])].sort(
      (idA, idB) => idA - idB,
    );

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
