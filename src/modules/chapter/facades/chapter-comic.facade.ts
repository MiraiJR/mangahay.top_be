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
import { title } from 'process';

@Injectable()
export class ChapterComicFacade {
  constructor(
    private readonly datasource: DataSource,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly googleApiService: GoogleApiService,
    private readonly comicInteractionRepository: ComicInteractionRepository,
    @InjectQueue(QueueName.NOTIFICAION) private notificationQueue: Queue,
  ) {}

  async createChapter(
    inputData: CreateChapterDTO,
    imageFiles: Express.Multer.File[],
    creatorId: number,
  ) {
    const { name, comicId, isEnd } = inputData;
    const matchedComic = await this.getComicById(comicId);
    this.canOperationOnComic(creatorId, matchedComic);

    let chapterType = ChapterType.NORMAL;
    let order = name.match(/[+-]?\d+(\.\d+)?/g)[0] ?? null;

    if (!order) {
      chapterType = ChapterType.EXTRA;
      order = '0';
    }

    return this.datasource.transaction(async (manager) => {
      const newChapter = await manager.getRepository(Chapter).save({
        name,
        comicId,
        slug: customSlugify(name),
        images: [],
        order: parseFloat(order),
        type: chapterType,
        creatorId,
      });

      if (isEnd === 1) {
        this.markComicDoneStatus(comicId, manager);
      }

      const images = await this.s3Service
        .uploadMultipleFile(imageFiles, `comics/${newChapter.comicId}/${newChapter.id}`)
        .then((uploadedFiles) => uploadedFiles.map((uploadedFile) => uploadedFile.relativePath));

      await manager.getRepository(Chapter).update(
        {
          id: newChapter.id,
        },
        {
          images,
        },
      );

      this.indexingUrl(matchedComic.slug, newChapter.slug);

      this.sendNotifyToListFollowedUser(comicId, matchedComic, newChapter);

      return {
        ...newChapter,
        images,
      };
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
    if ((comic.creator && comic.creatorId !== userId) || comic.creator === null) {
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

  private async sendNotifyToListFollowedUser(comicId: number, comic: Comic, chapter: Chapter) {
    const listFollowedUserId = await this.comicInteractionRepository.getUsersFollowedComic(comicId);
    if (listFollowedUserId.length === 0) {
      return;
    }

    const notificationJobs = this.buildBulkNotificationEvent(listFollowedUserId, comic, chapter);

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
}
