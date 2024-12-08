import { ComicPrivilegeRepository } from '@modules/comic/comic-privilege/comic-privilege.repository';
import { ComicRepository } from '@modules/comic/comic.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserManageComicFacade {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly comicPrivilegeRepository: ComicPrivilegeRepository,
  ) {}

  async comicManagedByUserId(userId: number) {
    const comicIdsCreated = await this.comicRepository.getComicIdsByCreator(userId);
    const comicIdsCanAccess = await this.comicPrivilegeRepository.getComicIdsManagedByUserId(
      userId,
    );

    const comicIdsManaged = [...new Set([...comicIdsCreated, ...comicIdsCanAccess])];

    const comicsManagedByUserId = await this.comicRepository.getComicByIdsOfUserId(
      userId,
      comicIdsManaged,
    );

    return comicsManagedByUserId;
  }
}
