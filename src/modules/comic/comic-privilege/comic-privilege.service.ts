import { Injectable } from '@nestjs/common';
import { ComicPrivilegeRepository } from './comic-privilege.repository';
import { ApplicationException } from '@common/exception/application.exception';
import ComicError from '../resources/error/error';
import { ComicPrivilegeEntity } from './comic-privilege.entity';
import { removeArrayFieldOfObject } from '@common/utils/helper';
import { ComicUtilService } from '../shared/comic.util';
import { SinglePrivilegeRequest } from '../dtos/single-privilege.request';

@Injectable()
export class ComicPrivilegeService {
  constructor(
    private readonly comicPrivilegeRepository: ComicPrivilegeRepository,
    private readonly comicUtilService: ComicUtilService,
  ) {}

  async getListPrivilegesOfSpecifiedComic(userId: number, comicId: number) {
    await this.checkUserInListManagerOfComic(userId, comicId);

    const mangersWithPrivilege =
      await this.comicPrivilegeRepository.getManagersWithTheirPermissionsOfComic(comicId);

    const result = mangersWithPrivilege.map((managerWithPrivilege) => {
      removeArrayFieldOfObject<ComicPrivilegeEntity>(managerWithPrivilege, ['userId']);
      return managerWithPrivilege;
    });

    return result;
  }

  async addUserRightForSpecifiedUser(
    updatorId: number,
    comicId: number,
    inputData: SinglePrivilegeRequest,
  ) {
    await this.comicUtilService.checkCreator(updatorId, comicId);
    const { userId: targetUserId, permissions: targetPermissions } = inputData;
    if (updatorId === targetUserId) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0004);
    }

    const matchedPrivilegeRow = await this.comicPrivilegeRepository.getPrivilegeByUserIdAndComicId(
      targetUserId,
      comicId,
    );
    const isExisted = !!matchedPrivilegeRow;

    if (isExisted) {
      await this.comicPrivilegeRepository.update(
        {
          id: matchedPrivilegeRow.id,
        },
        {
          permissions: inputData.permissions,
        },
      );
    } else {
      await this.comicPrivilegeRepository.save({
        userId: targetUserId,
        comicId,
        permissions: targetPermissions,
      });
    }
  }

  private async checkUserInListManagerOfComic(userId: number, comicId: number) {
    const matchedComic = await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);
    if (matchedComic.creatorId && userId === matchedComic.creatorId) {
      return true;
    }

    const managerIds = await this.comicPrivilegeRepository.getManagerIdsOfComicId(comicId);
    if (!managerIds.includes(userId)) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0002);
    }
  }
}
