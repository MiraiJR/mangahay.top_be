import { Body, Controller, Get, Param, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { ComicPrivilegeService } from './comic-privilege.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { RoleGuard, Roles } from '@common/guards/role.guard';
import { UserRole } from '@modules/user/user.role';
import UserId from '@common/decorators/userId';
import { SinglePrivilegeRequest } from '../dtos/single-privilege.request';

@Controller('api/comics/:comicId/privileges')
export class ComicPrivilegeController {
  constructor(private readonly comicPrivilegeService: ComicPrivilegeService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Get()
  async handleGetListPrivileges(@UserId() userId: number, @Param('comicId') comicId: number) {
    return this.comicPrivilegeService.getListPrivilegesOfSpecifiedComic(userId, comicId);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Put()
  async handleUpdateListPrivilegeOfManger(
    @UserId() updatorId: number,
    @Param('comicId') comicId: number,
    @Body(new ValidationPipe()) inputData: SinglePrivilegeRequest,
  ) {
    await this.comicPrivilegeService.addUserRightForSpecifiedUser(updatorId, comicId, inputData);

    return 'Cập nhật quyền cho người dùng thành công';
  }
}
