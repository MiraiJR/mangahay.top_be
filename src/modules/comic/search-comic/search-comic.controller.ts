import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchComicService } from './search-comic.service';
import { SearchComicRequest } from './dto/search-comic.request';
import { AuthGuard } from '@common/guards/auth.guard';
import { RoleGuard, Roles } from '@common/guards/role.guard';
import { UserRole } from '@modules/user/user.role';
import UserId from '@common/decorators/user-id';
import { SearchManagedComicRequest } from './dto/search-managed-comic.request';

@Controller('search')
export class SearchComicController {
  constructor(private readonly searchComicService: SearchComicService) {}

  @Get('/comics')
  async handleSearchComic(@Query() queryData: SearchComicRequest) {
    return this.searchComicService.searchComic(queryData);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Get('/managed-comics')
  async handleSearchManagedComic(
    @UserId() userId: number,
    @Query() queryData: SearchManagedComicRequest,
  ) {
    return this.searchComicService.searchManagedComic(userId, queryData);
  }
}
