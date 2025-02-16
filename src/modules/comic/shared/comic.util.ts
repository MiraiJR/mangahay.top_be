import { Injectable } from '@nestjs/common';
import { ComicRepository } from '../comic.repository';
import { ApplicationException } from '@common/exception/application.exception';
import ComicError from '../resources/error/error';
import { Comic } from '../comic.entity';
import { ComicPrivilegeRepository } from '../comic-privilege/comic-privilege.repository';

@Injectable()
export class ComicUtilService {
  constructor(
    private readonly comicRepository: ComicRepository,
    private readonly comicPrivilegeRepository: ComicPrivilegeRepository,
  ) {}

  async getComicByIdThrowExceptionIfNotExist(comicId: number): Promise<Comic> {
    const comic = await this.comicRepository.getComicById(comicId);

    if (!comic) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0001);
    }

    return comic;
  }

  async checkCreator(userId: number, comicId: number): Promise<void> {
    const comic = await this.getComicByIdThrowExceptionIfNotExist(comicId);

    if (!comic.creatorId || userId !== comic.creatorId) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0002);
    }
  }

  getAllComic(): Promise<Comic[]> {
    return this.comicRepository.getAll();
  }

  async getListComicIdMangedByUserId(userId: number): Promise<number[]> {
    const comicIdsCreated = await this.comicRepository.getComicIdsByCreator(userId);
    const comicIdsCanAccess = await this.comicPrivilegeRepository.getComicIdsManagedByUserId(
      userId,
    );

    const comicIdsManaged = [...new Set([...comicIdsCreated, ...comicIdsCanAccess])].sort(
      (idA, idB) => idA - idB,
    );

    return comicIdsManaged;
  }
}
