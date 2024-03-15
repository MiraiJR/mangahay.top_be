import { Controller, Get } from '@nestjs/common';
import { GenreService } from './genre.service';

@Controller('/api/genres')
export class GenreController {
  constructor(private genreService: GenreService) {}

  @Get()
  async handleGetGenres() {
    const genres = await this.genreService.getGenres();

    return genres;
  }
}
