import { Injectable } from '@nestjs/common';
import { GenreRepository } from './genre.repository';

@Injectable()
export class GenreService {
  constructor(private genreRepository: GenreRepository) {}

  async getGenres() {
    return this.genreRepository.find();
  }
}
