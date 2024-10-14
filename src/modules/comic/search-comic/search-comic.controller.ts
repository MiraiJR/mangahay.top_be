import { Controller, Get, Query } from '@nestjs/common';
import { SearchComicService } from './search-comic.service';
import { SearchComicRequest } from './dto/search-comic.request';

@Controller('api/search/comics')
export class SearchComicController {
  constructor(private readonly searchComicService: SearchComicService) {}

  @Get()
  async handleSearchComic(@Query() queryData: SearchComicRequest) {
    return this.searchComicService.searchComic(queryData);
  }
}
