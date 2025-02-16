import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserManageComicFacade } from '../facades/user-manage-comic.facade';
import UserId from '@common/decorators/user-id';
import { AuthGuard } from '@common/guards/auth.guard';
import { ComicsManagedByMeQuery } from '../dtos/comics-managed-by-me.request';

@Controller('/api/users/me/management')
export class UserManagementController {
  constructor(private readonly userManageComicFacade: UserManageComicFacade) {}

  @UseGuards(AuthGuard)
  @Get('/comics')
  getComicsManagedMe(
    @UserId() userId: number,
    @Query(new ValidationPipe()) inputQuery: ComicsManagedByMeQuery,
  ) {
    const { page, size } = inputQuery;
    return this.userManageComicFacade.comicManagedByUserId(userId, { page, size });
  }
}
