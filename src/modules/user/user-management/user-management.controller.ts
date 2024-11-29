import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserManageComicFacade } from '../facades/user-manage-comic.facade';
import UserId from '@common/decorators/userId';
import { AuthGuard } from '@common/guards/auth.guard';

@Controller('/api/users/me/management')
export class UserManagementController {
  constructor(private readonly userManageComicFacade: UserManageComicFacade) {}

  @UseGuards(AuthGuard)
  @Get('/comics')
  getComicsManagedMe(@UserId() userId: number) {
    return this.userManageComicFacade.comicManagedByUserId(userId);
  }
}
