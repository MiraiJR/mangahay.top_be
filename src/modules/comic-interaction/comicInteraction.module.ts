import { Module } from '@nestjs/common';
import { ComicInteractionService } from './comicInteraction.service';
import { ComicInteraction } from './comicInteraction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicInteractionRepository } from './comicInteraction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ComicInteraction])],
  controllers: [],
  providers: [ComicInteractionService, ComicInteractionRepository],
  exports: [ComicInteractionService],
})
export class ComicInteractionModule {}
