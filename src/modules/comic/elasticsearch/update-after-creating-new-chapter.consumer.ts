import { QueueName } from '@common/constant/queue-channel';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ComicService } from '../comic.service';
import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { Comic } from '../comic.entity';
import { Logger } from '@nestjs/common';
import { removeArrayFieldOfObject } from '@common/utils/helper';
import { Chapter } from '@modules/chapter/chapter.entity';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';

@Processor(QueueName.COMIC_ELASTICSEARCH_NEW_CHAPTER)
export class UpdateComicAfterCreatingNewChapterConsumer {
  private logger: Logger;
  constructor(
    private readonly comicService: ComicService,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
  ) {
    this.logger = new Logger(UpdateComicAfterCreatingNewChapterConsumer.name);
  }

  @Process()
  async updateComicAfterCreatingNewChapter(job: Job) {
    const comicId = job.data;
    const matchedComic = await this.comicService.getComicById(comicId);
    const shortedChapterData = matchedComic.chapters.map((chapter) => {
      removeArrayFieldOfObject<Chapter>(chapter, [
        'images',
        'type',
        'order',
        'creatorId',
        'comicId',
      ]);
      return chapter;
    });
    matchedComic.chapters = shortedChapterData;
    delete matchedComic.comments;
    await this.elasticsearchAdapter.updateRecord<Comic>(IndexName.COMICS, comicId, matchedComic);
  }

  @OnQueueFailed()
  handleFailUpdateComicAfterCreatingNewChapter(job: Job<number>) {
    this.logger.error(job.failedReason);
  }
}
