import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreateChapterDTO } from '../dtos/create-chapter';
import { Chapter } from '../chapter.entity';
import { customSlugify } from '@common/configs/slugify.config';
import { S3Service } from '@common/external-service/image-storage/s3.service';
import { ChapterType } from '../types/ChapterType';
import { ConfigService } from '@nestjs/config';
import { GoogleApiService } from '@modules/google-api/google-api.service';
import { Comic } from '@modules/comic/comic.entity';
import { ApplicationException } from '@common/exception/application.exception';
import ComicError from '@modules/comic/resources/error/error';
import { StatusComic } from '@modules/comic/enums/status-comic';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { QueueName } from '@common/constant/queue-channel';
import { ComicInteractionRepository } from '@modules/comic/comic-interaction/comicInteraction.repository';
import { NotificationEvent } from '@modules/notification/notification.interface';
import { CrawlerService } from '@common/external-service/crawler/crawler.service';
import { IChapter } from '../chapter.interface';
import { ChapterService } from '../chapter.service';
import { CrawlChapterDTO } from '../dtos/crawl-chapter';
import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';

@Injectable()
export class ChapterComicFacade {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly datasource: DataSource,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly googleApiService: GoogleApiService,
    private readonly comicInteractionRepository: ComicInteractionRepository,
    private readonly chapterService: ChapterService,
    @InjectQueue(QueueName.NOTIFICAION) private notificationQueue: Queue,
    @InjectQueue(QueueName.COMIC_ELASTICSEARCH_NEW_CHAPTER) private comicElasticsearchQueue: Queue,
  ) {}

  async createChapter(
    inputData: CreateChapterDTO,
    imageFiles: Express.Multer.File[],
    creatorId: number,
  ) {
    const { name, comicId, isEnd } = inputData;
    const matchedComic = await this.getComicById(comicId);
    this.canOperationOnComic(creatorId, matchedComic);

    const { chapterType, order } = this.getChapterTypeAndOrder(name);

    return this.datasource.transaction(async (manager) => {
      const newChapter = await this.createNewChapterWithoutImages(manager, {
        name,
        comicId,
        creatorId,
        order,
        type: chapterType,
      });

      if (isEnd === 1) {
        this.markComicDoneStatus(comicId, manager);
      }

      const images = await this.s3Service
        .uploadMultipleFile(imageFiles, `comics/${newChapter.comicId}/${newChapter.id}`)
        .then((uploadedFiles) => uploadedFiles.map((uploadedFile) => uploadedFile.relativePath));

      await this.updateImagesForCreatedChapter(manager, newChapter.id, images);
      this.indexingUrl(matchedComic.slug, newChapter.slug);
      this.updateUpdatedTimeForComic(manager, comicId);

      this.sendNotifyToListFollowedUser(matchedComic, newChapter);
      this.updateComicOnElasticsearch(comicId);

      return {
        ...newChapter,
        images,
      };
    });
  }

  async crawlSingleChapter(userId: number, inputData: CrawlChapterDTO) {
    const { comicId, nameChapter, urlPost, querySelector, attribute } = inputData;
    const matchedComic = await this.getComicById(comicId);
    this.canOperationOnComic(userId, matchedComic);

    const { chapterType, order } = this.getChapterTypeAndOrder(nameChapter);
    await this.chapterService.checkChapterWithOrderExisted(comicId, order);

    await this.datasource.transaction(async (manager) => {
      const imageUrls = await this.crawlImageUrls(urlPost, querySelector, attribute);
      const newChapter = await this.createNewChapterWithoutImages(manager, {
        name: nameChapter,
        comicId,
        creatorId: userId,
        order: order,
        type: chapterType,
      });

      const images = await this.uploadCrawledImageUrlToStorage(comicId, newChapter.id, imageUrls);

      if (images.length !== imageUrls.length) {
        throw new ApplicationException(ComicError.CRAWLER_CHAPTER_ERROR_0001);
      }

      await this.updateImagesForCreatedChapter(manager, newChapter.id, images);
      this.indexingUrl(matchedComic.slug, newChapter.slug);
      await this.updateUpdatedTimeForComic(manager, comicId);

      this.sendNotifyToListFollowedUser(matchedComic, newChapter);
      this.updateComicOnElasticsearch(comicId);

      return {
        ...newChapter,
        images,
      };
    });
  }

  private updateComicOnElasticsearch(comicId: number) {
    this.comicElasticsearchQueue.add(comicId, {
      removeOnComplete: true,
      attempts: 3,
    });
  }

  private async updateUpdatedTimeForComic(manager: EntityManager, comicId: number) {
    await manager.getRepository(Comic).update(
      {
        id: comicId,
      },
      {
        updatedAt: new Date(),
      },
    );
  }

  private async updateImagesForCreatedChapter(
    manager: EntityManager,
    chapterId: number,
    images: string[],
  ) {
    return manager.getRepository(Chapter).update(
      {
        id: chapterId,
      },
      {
        images,
        updatedAt: new Date(),
      },
    );
  }

  private async uploadCrawledImageUrlToStorage(
    comicId: number,
    chapterId: number,
    imageUrls: string[],
  ): Promise<string[]> {
    const folder = `comics/${comicId}/${chapterId}`;

    const images = await Promise.all(
      imageUrls.map(async (imageUrl, index) => {
        const fileName = index.toString();
        const { relativePath } = await this.s3Service.uploadImageFromUrl(
          imageUrl,
          folder,
          fileName,
        );
        return relativePath;
      }),
    );

    return images;
  }

  private createNewChapterWithoutImages(manager: EntityManager, chapter: IChapter) {
    return manager.getRepository(Chapter).save({
      ...chapter,
      slug: customSlugify(chapter.name),
      images: [],
    });
  }

  private indexingUrl(comicSlug: string, chapterSlug: string) {
    const newChapterUrl = `${this.configService.get<string>(
      'HOST_FE',
    )}/truyen/${comicSlug}/${chapterSlug}`;
    this.googleApiService.indexingUrl(newChapterUrl);
  }

  private async getComicById(comicId: number) {
    const matchedComic = await this.datasource.getRepository(Comic).findOne({
      where: {
        id: comicId,
      },
    });

    if (!matchedComic) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0001);
    }

    return matchedComic;
  }

  private canOperationOnComic(userId: number, comic: Comic) {
    if ((comic.creatorId && comic.creatorId !== userId) || comic.creatorId === null) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0002);
    }

    if (comic.state !== StatusComic.PROCESSING) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0003);
    }
  }

  private markComicDoneStatus(comicId: number, manager: EntityManager) {
    manager.getRepository(Comic).update(
      {
        id: comicId,
      },
      {
        updatedAt: new Date(),
        state: StatusComic.FINISH,
      },
    );
  }

  private async sendNotifyToListFollowedUser(comic: Comic, chapter: Chapter) {
    const listFollowedUserId = await this.comicInteractionRepository.getUsersFollowedComic(
      comic.id,
    );
    const userIdsWithoutCreator = listFollowedUserId.filter((userId) => userId !== comic.creatorId);
    if (listFollowedUserId.length === 0) {
      return;
    }

    const notificationJobs = this.buildBulkNotificationEvent(userIdsWithoutCreator, comic, chapter);

    this.notificationQueue.addBulk(notificationJobs);
  }

  private buildBulkNotificationEvent(
    userIds: number[],
    comic: Comic,
    chapter: Chapter,
  ): Job<NotificationEvent>[] {
    return userIds.map((userId) => {
      return {
        name: 'notification-chapter',
        data: {
          userId,
          title: `Truyện ${comic.name} vừa cập nhật thêm chương mới!`,
          body: `${chapter.name} đã lên sóng đọc ngay!!!`,
          module: 'chapter',
          redirectUrl: `/truyen/${comic.slug}/${chapter.slug}`,
          thumb: comic.thumb,
        },
        opts: {
          removeOnComplete: true,
          attempts: 3,
        },
      } as Job;
    });
  }

  private async crawlImageUrls(url: string, querySelector: string, attribute: string) {
    let imageUrls = [];

    if (url.includes('facebook')) {
      imageUrls = await this.crawlerService.crawlImagesFromFacebookPost(url);
    } else {
      imageUrls = await this.crawlerService.crawlImagesFromLinkWebsite(
        url,
        querySelector,
        attribute,
      );
    }

    console.log(imageUrls);

    if (imageUrls.length === 0) {
      throw new ApplicationException(ComicError.CRAWLER_CHAPTER_ERROR_0001);
    }

    return imageUrls;
  }

  private getChapterTypeAndOrder(chapterName: string) {
    let chapterType = ChapterType.NORMAL;
    let order = chapterName.match(/[+-]?\d+(\.\d+)?/g)[0] ?? null;

    if (!order) {
      chapterType = ChapterType.EXTRA;
      order = '0';
    }

    return {
      chapterType,
      order: parseFloat(order),
    };
  }
}
