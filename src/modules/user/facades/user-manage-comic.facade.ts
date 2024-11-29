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
    const comicsCreatedByUserId = await this.comicRepository.getComicsByCreator(userId);
    const comicIdsManagedByUserId = await this.comicPrivilegeRepository.getComicIdsManagedByUserId(
      userId,
    );

    const comicsManagedByUserId = await this.comicRepository.getComicByIdsOfUserId(
      userId,
      comicIdsManagedByUserId,
    );

    const comicMap = new Map();
    comicsCreatedByUserId.forEach((comic) => comicMap.set(comic.id, comic));
    comicsManagedByUserId.forEach((comic) => comicMap.set(comic.id, comic));

    return Array.from(comicMap.values());
  }
}
