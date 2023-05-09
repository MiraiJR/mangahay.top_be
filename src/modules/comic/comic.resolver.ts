import { Logger } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { ComicService } from './comic.service';
import { ComicDTO } from './DTO/comic-dto';

@Resolver()
export class ComicResolver {
  constructor(
    private logger: Logger = new Logger(ComicResolver.name),
    private comicService: ComicService,
  ) {}

  @Query(() => [ComicDTO])
  async getAllComic() {
    try {
      console.log('zo');
      const result = await this.comicService.getAllComic();

      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
