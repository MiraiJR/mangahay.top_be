import { QueueName } from '@common/constant/queue-channel';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { Comic } from '../comic.entity';
import { Logger } from '@nestjs/common';
import { removeArrayFieldOfObject } from '@common/utils/helper';
import { Chapter } from '@modules/chapter/chapter.entity';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';
import { ComicUtilService } from '../shared/comic.util';

@Processor(QueueName.COMIC_ELASTICSEARCH_NEW_CHAPTER)
export class UpdateComicAfterCreatingNewChapterConsumer {
  private logger: Logger;
  constructor(
    private readonly comicUtilService: ComicUtilService,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
  ) {
    this.logger = new Logger(UpdateComicAfterCreatingNewChapterConsumer.name);
  }

  @Process()
  async updateComicAfterCreatingNewChapter(job: Job) {
    const comicId = job.data;
    const matchedComic = await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);
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
