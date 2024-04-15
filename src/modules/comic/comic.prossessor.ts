import { OnQueueActive, OnQueueCompleted, OnQueueError, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ComicService } from './comic.service';

@Processor('crawl-chapters')
export class CrawlChaptersProcessor {
  private readonly logger = new Logger(CrawlChaptersProcessor.name);
  constructor(private readonly comicService: ComicService) {}

  @Process('crawl-chapters-multiple')
  async handleCrawlChapters(job: Job) {
    this.logger.log(
      `Hệ thông đang crawl dữ liệu từ ${job.data.chapterUrl} - ${job.data.chapterName}. UserId: ${job.data.userId}`,
    );

    await this.comicService.crawlImagesForChapter(
      job.data.userId,
      job.data.comic,
      job.data.chapterName,
      job.data.chapterUrl,
      job.data.querySelectorImageUrl,
      job.data.attributeImageUrl,
    );
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed job ${job.id}.`);
  }
}
