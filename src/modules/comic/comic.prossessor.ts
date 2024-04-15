import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ComicService } from './comic.service';
import { NotificationService } from '../notification/notification.service';
import { INotification } from '../notification/notification.interface';
import { ConfigService } from '@nestjs/config';

@Processor('crawl-chapters')
export class CrawlChaptersProcessor {
  private readonly logger = new Logger(CrawlChaptersProcessor.name);
  constructor(
    private readonly comicService: ComicService,
    private readonly notifyService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

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

  @OnQueueFailed()
  onFailed(job: Job) {
    this.logger.log(`${job.queue.name}#${job.id} failed`);
    job.remove();
  }

  @OnQueueCompleted()
  async onCompleted(job: Job) {
    const { comic } = job.data;
    this.logger.log(`Completed job ${job.id}.`);

    if (job.data.userId) {
      const notify: INotification = {
        userId: job.data.userId,
        title: 'Cào dữ liệu thành công!',
        body: `Qúa trình cào dữ liệu cho truyện ${comic.name} diễn ra thành công!`,
        redirectUrl: `${this.configService.get<string>('HOST_FE')}/truyen/${comic.slug}`,
        thumb: comic.thumb,
      };

      await this.notifyService.create(notify);
    }

    job.remove();
  }
}
