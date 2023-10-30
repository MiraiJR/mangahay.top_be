import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GenreRepository extends Repository<Genre> {
  constructor(
    @InjectRepository(Genre)
    repository: Repository<Genre>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
