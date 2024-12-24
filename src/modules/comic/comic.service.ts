import { Injectable } from '@nestjs/common';
import { ChapterService } from '../chapter/chapter.service';
import { ComicRepository } from './comic.repository';
import { Comic } from './comic.entity';
import { NotificationService } from '../notification/notification.service';
import { INotification } from '../notification/notification.interface';
import { CommentService } from '../comment/comment.service';
import { buildSlug } from 'src/common/utils/helper';
import { ConfigService } from '@nestjs/config';
import { UpdateComicDTO } from './dtos/update-comic';
import { DataSource, EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { GoogleApiService } from '../google-api/google-api.service';
import { S3Service } from '@common/external-service/image-storage/s3.service';
import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { CreateComicDTO } from './dtos/create-comic';
import { ComicInteractionService } from './comic-interaction/comicInteraction.service';
import { ComicInteractionRepository } from './comic-interaction/comicInteraction.repository';
import { ApplicationException } from '@common/exception/application.exception';
import ComicError from './resources/error/error';
import { CommentRepository } from '@modules/comment/comment.repository';
import { ChapterRepository } from '@modules/chapter/chapter.repository';
import { CommentQuery } from './models/requests/comments.query';
import { Chapter } from '@modules/chapter/chapter.entity';
import { StatusComic } from './enums/status-comic';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';
import { ComicNotificationService } from './notification/comic.notifcation';
import { ComicPrivilegeRepository } from './comic-privilege/comic-privilege.repository';
import { ComicPrivilegePermission } from './comic-privilege/comic-privilege.enum';
import { ComicUtilService } from './shared/comic.util';
import { GetComicsDTO } from './dtos/get-comics';
import { GetChaptersQuery } from './dtos/get-chapters.query';

@Injectable()
export class ComicService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly chapterRepository: ChapterRepository,
    private readonly notifyService: NotificationService,
    private readonly chapterService: ChapterService,
    private readonly comicRepository: ComicRepository,
    private readonly s3Service: S3Service,
    private readonly comicInteractionService: ComicInteractionService,
    private readonly comicInteractionRepository: ComicInteractionRepository,
    private readonly commentService: CommentService,
    private readonly configService: ConfigService,
    private readonly googleApiService: GoogleApiService,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
    private readonly commentRepository: CommentRepository,
    private readonly datasource: DataSource,
    private readonly comicNotificationService: ComicNotificationService,
    private readonly comicPrivilegeRepository: ComicPrivilegeRepository,
    private readonly comicUtilService: ComicUtilService,
  ) {}

  async getListCommentOfComic(comicId: number, inputQuery: CommentQuery) {
    const { size, page } = inputQuery;
    const totalAnswer = await this.commentRepository.countCommentParentOfComic(comicId);
    const hasPrevious = totalAnswer > page * size;

    const comments = await this.commentRepository.getCommentParentsByComicId(comicId, page, size);

    return {
      comments,
      hasPrevious,
      total: totalAnswer,
    };
  }

  async getComicsWithChapters() {
    return this.comicRepository.findComicsWithChapters();
  }

  async getChapters(comicId: number, query: GetChaptersQuery) {
    const { page, size, isGetAll } = query;
    const total = await this.chapterRepository.countTotalChapterOfComic(comicId);
    const chapters = await this.chapterRepository.getListChapterByComicId(
      comicId,
      { page, size },
      isGetAll,
    );

    return {
      total,
      chapters,
    };
  }

  async delete(userId: number, comicId: number) {
    const matchedComic = await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);

    await this.canProcessComicWithUserRight(
      userId,
      matchedComic,
      ComicPrivilegePermission.REMOVE_COMIC,
    );

    await this.datasource.transaction(async (manager) => {
      await manager.getRepository(Comic).delete(comicId);
      this.elasticsearchAdapter.deleteRecord(IndexName.COMICS, comicId);
    });
  }

  private async canProcessComicWithUserRight(
    userId: number,
    comic: Comic,
    targetPrivilege: ComicPrivilegePermission,
  ) {
    if (userId === comic.creatorId) {
      return true;
    }

    const listManagerWithPermissions =
      await this.comicPrivilegeRepository.getManagersWithTheirPermissionsOfComic(comic.id);
    const matchedManager = listManagerWithPermissions.find((manager) => manager.user.id === userId);

    if (matchedManager && matchedManager.permissions.includes(targetPrivilege)) {
      return true;
    }

    throw new ApplicationException(ComicError.COMIC_ERROR_0002);
  }

  async getComics(query: GetComicsDTO) {
    const { page, size } = query;
    const result = await this.comicRepository.getComicsWithPagination(page, size, 'updatedAt');

    return {
      ...query,
      ...result,
    };
  }

  async countComics() {
    return await this.comicRepository.count();
  }

  async getComicBySlug(slugComic: string) {
    const comic = await this.comicRepository.getComicBySlug(slugComic);

    if (!comic) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0001);
    }

    const [like, follow] = await Promise.all([
      this.comicInteractionRepository.countLikeOfComic(comic.id),
      this.comicInteractionRepository.countFollowOfComic(comic.id),
    ]);

    const translators =
      comic.translators.length !== 0
        ? comic.translators
        : [comic.creator?.fullname ?? 'Đang cập nhật'];

    return {
      ...comic,
      translators,
      like,
      follow,
    };
  }

  createComic(
    creatorId: number,
    comic: CreateComicDTO,
    thumb: Express.Multer.File,
  ): Promise<Comic> {
    return this.datasource.transaction(async (manager) => {
      const { id: comicId, slug } = await manager.getRepository(Comic).save({
        ...comic,
        creatorId,
        slug: buildSlug(comic.name),
      });

      const urlOfNewComic = `${this.configService.get<string>('HOST_FE')}/truyen/${slug}`;
      this.googleApiService.indexingUrl(urlOfNewComic);

      const { relativePath } = await this.s3Service.uploadFileFromBuffer(
        thumb.buffer,
        `comics/${comicId}`,
        `${comicId}.jpeg`,
      );

      await manager.getRepository(Comic).update(
        {
          id: comicId,
        },
        {
          thumb: relativePath,
        },
      );

      const createdComic = await manager.getRepository(Comic).findOne({
        where: {
          id: comicId,
        },
      });

      this.elasticsearchAdapter.addRecord(IndexName.COMICS, createdComic, createdComic.id);

      return createdComic;
    });
  }

  checkCreatorOfComic(userId: number, comic: Comic): boolean {
    if (!comic.creator || comic.creatorId === userId) {
      return true;
    }

    throw new ApplicationException(ComicError.COMIC_ERROR_0002);
  }

  async updateComic(
    userId: number,
    comicId: number,
    inputData: UpdateComicDTO,
    thumb?: Express.Multer.File,
  ): Promise<Comic> {
    const { changedFields, changedData } = inputData;
    let updatedComic = await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);
    this.checkCreatorOfComic(userId, updatedComic);

    changedFields.forEach((changedField, index) => {
      if (['genres', 'authors', 'translators'].includes(changedField)) {
        updatedComic[changedField] = JSON.parse(changedData[index]);
      } else {
        updatedComic[changedField] = changedData[index];
      }
    });
    updatedComic.updateTimeStamp();

    if (!!thumb) {
      changedFields.push('thumb');
      const { relativePath } = await this.s3Service.uploadFileFromBuffer(
        thumb.buffer,
        `comics/${updatedComic.id}`,
        thumb.filename,
      );

      updatedComic.thumb = relativePath;
    }

    return this.datasource.transaction(async (manager) => {
      const comic = await manager.getRepository(Comic).save(updatedComic);

      this.comicNotificationService.sendNotifyToListManagerAfterUpdatingComic(
        userId,
        comic,
        changedFields,
      );
      this.elasticsearchAdapter.updateRecord<Comic>(IndexName.COMICS, comic.id, comic);

      return comic;
    });
  }

  async increaseViewForComic(comicId: number) {
    await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);
    await this.comicRepository.increamentView(comicId);
  }

  async ranking(query: { field: string; limit: number }) {
    const comics = await this.comicRepository.getComicsWithPagination(1, query.limit, query.field);

    return comics;
  }

  async evaluateComic(userId: number, comicId: number, score: number) {
    await this.comicInteractionService.evaluateComic(userId, comicId, score);

    const newRatingStar = await this.comicInteractionService.calculateEvaluatedRatingStar(comicId);

    return await this.comicRepository.save({
      id: comicId,
      star: newRatingStar,
    });
  }

  async updateTimeAndNotifyToFollowingUsersAfterCreatingChapter(comic: Comic, newChapter: Chapter) {
    await this.comicRepository.updateTimeForComic(comic.id);
    const listUserId = await this.comicInteractionService.getListUserIdFollowedComic(comic.id);
    for (const userId of listUserId) {
      const notify: INotification = {
        userId: userId,
        title: 'Chương mới!',
        body: `${comic.name} vừa cập nhật thêm chapter mới - ${newChapter.name}.`,
        redirectUrl: `/truyen/${comic.slug}/${newChapter.slug}`,
        thumb: comic.thumb,
      };

      this.notifyService.create(notify);
    }
  }

  async getSpecificChapterOfComicWithPreviousAndNextChapter(comicId: number, chapterId: number) {
    await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);
    const chapter = this.chapterService.getSpecificChapterOfComicWithPreviousAndNextChapter(
      comicId,
      chapterId,
    );

    return chapter;
  }

  async commentOnComic(userId: number, comicId: number, content: string) {
    const comic = await this.comicUtilService.getComicByIdThrowExceptionIfNotExist(comicId);
    return this.commentService.createNewComment(userId, comic, content);
  }

  async getComicsCreatedByCreator(userId: number) {
    return this.comicRepository.getComicsByCreator(userId);
  }
}
