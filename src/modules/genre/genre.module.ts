import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { GenreRepository } from './genre.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genre])],
  controllers: [GenreController],
  providers: [GenreService, GenreRepository],
  exports: [GenreService],
})
export class GenreModule {}
