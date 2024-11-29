import { Injectable } from '@nestjs/common';
import { ComicRepository } from '../comic.repository';
import { ApplicationException } from '@common/exception/application.exception';
import ComicError from '../resources/error/error';
import { Comic } from '../comic.entity';

@Injectable()
export class ComicUtilService {
  constructor(private readonly comicRepository: ComicRepository) {}

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
}
