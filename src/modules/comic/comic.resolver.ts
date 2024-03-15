import { Logger } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { ComicService } from './comic.service';
import { ComicDTO } from './dtos/comic-dto';

@Resolver()
export class ComicResolver {
  constructor(
    private logger: Logger = new Logger(ComicResolver.name),
    private comicService: ComicService,
  ) {}

  // @Query(() => [ComicDTO])
  // async getAllComic() {
  //   try {
  //     // const result = await this.comicService.getComics();

  //     return result;
  //   } catch (error) {
  //     this.logger.error(error);
  //   }
  // }
}
