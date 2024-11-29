import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ComicPrivilegeEntity } from './comic-privilege.entity';

@Injectable()
export class ComicPrivilegeRepository extends Repository<ComicPrivilegeEntity> {
  constructor(
    @InjectRepository(ComicPrivilegeEntity)
    repository: Repository<ComicPrivilegeEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  getPrivilegeByUserIdAndComicId(userId: number, comicId: number) {
    return this.findOne({
      where: {
        comicId,
        userId,
      },
    });
  }

  updatePermissionsByUserIdAndComicId;

  async getPermissionOfUserByComicId(userId: number, comicId: number) {
    const previlege = await this.getPrivilegeByUserIdAndComicId(userId, comicId);

    return previlege?.permissions ?? [];
  }

  async getComicIdsManagedByUserId(userId: number) {
    const privileges = await this.find({
      where: {
        userId,
      },
    });

    const comicIds = privileges.map((privilege) => privilege.comicId);

    return comicIds;
  }

  async getManagerIdsOfComicId(comicId: number) {
    const privileges = await this.createQueryBuilder('privilege')
      .where('privilege.comicId = :comicId', { comicId })
      .leftJoinAndMapOne('privilege.user', 'User', 'user', 'privilege.userId = user.id')
      .select(['privilege', 'user.fullname'])
      .getMany();

    return privileges.map((privilege) => {
      return privilege.userId;
    });
  }

  getManagersWithTheirPermissionsOfComic(comicId: number) {
    return this.createQueryBuilder('privilege')
      .where('privilege.comicId = :comicId', { comicId })
      .leftJoinAndMapOne('privilege.user', 'User', 'user', 'privilege.userId = user.id')
      .select(['privilege', 'user.fullname', 'user.id', 'user.avatar'])
      .getMany();
  }
}
