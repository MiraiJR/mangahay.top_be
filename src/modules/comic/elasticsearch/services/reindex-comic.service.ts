import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';
import { removeArrayFieldOfObject } from '@common/utils/helper';
import { Chapter } from '@modules/chapter/chapter.entity';
import { Comic } from '@modules/comic/comic.entity';
import { ComicUtilService } from '@modules/comic/shared/comic.util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReindexComicService {
  constructor(
    private readonly comicUtilService: ComicUtilService,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
  ) {}

  async execute() {
    const comics = await this.comicUtilService.getAllComic();
    const convertedComics = this.convertData(comics);
    for (const comic of convertedComics) {
      await this.elasticsearchAdapter.updateRecord<Comic>(IndexName.COMICS, comic.id, comic);
    }

    // TODO
    // Making progress for the process
  }

  private convertData(comics: Comic[]) {
    return comics.map((comic) => {
      const shortedChapterData = comic.chapters.map((chapter) => {
        removeArrayFieldOfObject<Chapter>(chapter, [
          'images',
          'type',
          'order',
          'creatorId',
          'comicId',
        ]);
        return chapter;
      });
      comic.chapters = shortedChapterData;
      delete comic.comments;

      return comic;
    });
  }
}
