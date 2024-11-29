import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { SearchUserService } from './search-user.service';
import { SearchUserRequest } from './search-user.request';

@Controller('api/users/search')
export class SearchUserController {
  constructor(private readonly searchUserService: SearchUserService) {}

  @Get()
  handleSearchUser(@Query(new ValidationPipe()) inputQuery: SearchUserRequest) {
    return this.searchUserService.searchUser(inputQuery);
  }
}
