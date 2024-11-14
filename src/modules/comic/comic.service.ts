import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChapterService } from '../chapter/chapter.service';
import { ComicRepository } from './comic.repository';
import { Comic } from './comic.entity';
import { NotificationService } from '../notification/notification.service';
import { INotification } from '../notification/notification.interface';
import { CommentService } from '../comment/comment.service';
import Helper, { buildSlug } from 'src/common/utils/helper';
import { ConfigService } from '@nestjs/config';
import { Paging } from 'src/common/types/Paging';
import { UPDATE_IMAGE_WITH_FILE_OR_NOT, UpdateComicDTO } from './dtos/update-comic';
import { DataSource, EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { GoogleApiService } from '../google-api/google-api.service';
import { CrawlerService } from '../../common/external-service/crawler/crawler.service';
import { ChapterType } from '../chapter/types/ChapterType';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
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
    private readonly crawlerService: CrawlerService,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
    private readonly commentRepository: CommentRepository,
    private readonly datasource: DataSource,
    @InjectQueue('crawl-chapters') private readonly crawlChaptersQueue: Queue,
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

  // async crawlChaptersFromWebsite(
  //   userId: number,
  //   comicId: number,
  //   urls: string,
  //   querySelector: string,
  //   attribute: string,
  // ) {
  //   const arrayUrl = urls.split(',');
  //   for (let _index = 0; _index < arrayUrl.length; _index++) {
  //     const nameChapter = arrayUrl[_index].split('/').reverse()[0].split('-').join(' ');

  //     try {
  //       await this.crawlChapterForComic(
  //         userId,
  //         comicId,
  //         nameChapter,
  //         arrayUrl[_index],
  //         querySelector,
  //         attribute,
  //       );
  //     } catch (error) {
  //       continue;
  //     }
  //   }
  // }

  // async crawlImagesForChapter(
  //   userId: number,
  //   comic: Comic,
  //   nameChapter: string,
  //   urlPost: string,
  //   querySelector: string,
  //   attribute: string,
  // ) {
  //   let crawledImages = [];

  //   if (urlPost.includes('facebook')) {
  //     crawledImages = await this.crawlerService.crawlImagesFromFacebookPost(urlPost);
  //   } else {
  //     crawledImages = await this.crawlerService.crawlImagesFromLinkWebsite(
  //       urlPost,
  //       querySelector,
  //       attribute,
  //     );
  //   }

  //   if (crawledImages.length === 0) {
  //     throw new HttpException('Lỗi không crawl được dữ liệu!', HttpStatus.BAD_REQUEST);
  //   }

  //   return await this.manager.transaction(async (manager) => {
  //     let chapterType = ChapterType.NORMAL;
  //     let order = nameChapter.match(/[+-]?\d+(\.\d+)?/g)[0] ?? null;

  //     if (!order) {
  //       chapterType = ChapterType.EXTRA;
  //       order = '0';
  //     }

  //     await this.chapterService.checkChapterWithOrderExisted(comic.id, parseFloat(order));

  //     try {
  //       const newChapter = await this.chapterService.createNewChapterWithoutFiles(
  //         {
  //           name: nameChapter,
  //           comicId: comic.id,
  //           creator: userId,
  //           order: parseFloat(order),
  //           type: chapterType,
  //         },
  //         manager,
  //       );

  //       let imagesChapter = [];

  //       for (let _index = 0; _index < crawledImages.length; _index++) {
  //         const folder = `comics/${comic.id}/${newChapter.id}`;
  //         const imageName = `${_index}`;

  //         const linkImage = await this.s3Service.uploadImageFromUrl(
  //           crawledImages[_index],
  //           folder,
  //           imageName,
  //         );

  //         imagesChapter.push(linkImage);
  //       }

  //       if (imagesChapter.length === 0) {
  //         throw new HttpException(
  //           'Lỗi không crawl được dữ liệu hoặc trang web được crawl đã chặn quyền!',
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       }

  //       if (imagesChapter.length === crawledImages.length) {
  //         await this.chapterService.update(
  //           {
  //             ...newChapter,
  //             images: Helper.sortArrayImages(imagesChapter),
  //           },
  //           manager,
  //         );

  //         await manager.query('COMMIT');

  //         const newChapterUrl = `${this.configService.get<string>('HOST_FE')}/truyen/${
  //           comic.slug
  //         }/${newChapter.slug}`;
  //         this.googleApiService.indexingUrl(newChapterUrl);
  //       }

  //       await this.comicRepository.updateTimeForComic(comic.id);

  //       const listUserId = await this.comicInteractionService.getListUserIdFollowedComic(comic.id);

  //       for (const notifyToUserId of listUserId) {
  //         const notify: INotification = {
  //           userId: notifyToUserId,
  //           title: 'Chương mới!',
  //           body: `${comic.name} vừa cập nhật thêm chapter mới - ${newChapter.name}.`,
  //           redirectUrl: `/truyen/${comic.slug}/${newChapter.slug}`,
  //           thumb: comic.thumb,
  //         };

  //         this.notifyService.create(notify);
  //       }

  //       return newChapter;
  //     } catch (error) {
  //       await manager.query('ROLLBACK');
  //       const notify: INotification = {
  //         userId,
  //         title: 'Lỗi Cào Dữ Liệu!',
  //         body: `Qúa trình cào dữ liệu ${nameChapter} cho ${comic.name} diễn ra không thành công!`,
  //         redirectUrl: ``,
  //         thumb: comic.thumb,
  //       };

  //       this.notifyService.create(notify);
  //       throw new HttpException(
  //         'Lỗi không crawl được dữ liệu hoặc trang web được crawl đã chặn quyền!',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   });
  // }

  // async crawlChapterForComic(
  //   userId: number,
  //   comicId: number,
  //   nameChapter: string,
  //   urlPost: string,
  //   querySelector: string,
  //   attribute: string,
  // ) {
  //   const comic = await this.getComicById(comicId);

  //   await this.crawlImagesForChapter(userId, comic, nameChapter, urlPost, querySelector, attribute);
  // }

  // async crawlChaptersForComic(
  //   userId: number,
  //   comicId: number,
  //   urlNeedCrawled: string,
  //   querySelectorChapterUrl: string,
  //   attributeChapterUrl: string,
  //   querySelectorChapterName: string,
  //   querySelectorImageUrl: string,
  //   attributeImageUrl: string,
  // ): Promise<void> {
  //   const comic = await this.getComicById(comicId);
  //   const chaptersCrawlInformation = await this.crawlerService.crawlChapters(
  //     urlNeedCrawled,
  //     querySelectorChapterUrl,
  //     attributeChapterUrl,
  //     querySelectorChapterName,
  //   );

  //   for (const chapter of chaptersCrawlInformation) {
  //     await this.crawlChaptersQueue.add(
  //       'crawl-chapters-multiple',
  //       {
  //         userId,
  //         comic,
  //         chapterName: chapter.chapterName,
  //         chapterUrl: chapter.chapterUrl,
  //         querySelectorImageUrl,
  //         attributeImageUrl,
  //       },
  //       { delay: 3000, lifo: true },
  //     );
  //   }
  // }

  async getChapters(comicId: number) {
    return this.chapterRepository.getListChapterByComicId(comicId);
  }

  async delete(userId: number, comicId: number) {
    const matchedComic = await this.getComicById(comicId);

    this.checkCreatorOfComic(userId, matchedComic);

    await this.datasource.transaction(async (manager) => {
      await manager.getRepository(Comic).delete(comicId);
      this.elasticsearchAdapter.deleteRecord('comics', comicId);
    });
  }

  async getComics(query: Paging) {
    const result = await this.comicRepository.getComicsWithPagination(
      query.page,
      query.limit,
      'updatedAt',
    );

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

  async getComicById(comicId: number): Promise<Comic> {
    const comic = await this.comicRepository.getComicById(comicId);

    if (!comic) {
      throw new ApplicationException(ComicError.COMIC_ERROR_0001);
    }

    return comic;
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

      this.elasticsearchAdapter.addRecord('comics', createdComic, createdComic.id);

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
    data: UpdateComicDTO,
    file?: Express.Multer.File,
  ): Promise<Comic> {
    let updatedComic = await this.getComicById(comicId);
    this.checkCreatorOfComic(userId, updatedComic);

    updatedComic.name = data.name;
    updatedComic.anotherName = data.anotherName;
    updatedComic.genres = data.genres;
    updatedComic.authors = data.authors;
    updatedComic.briefDescription = data.briefDescription;
    updatedComic.translators = data.translators;
    updatedComic.state = data.state;
    updatedComic.generateSlug();
    updatedComic.updateTimeStamp();

    if (file && data.isUpdateImage === UPDATE_IMAGE_WITH_FILE_OR_NOT.YES) {
      const { relativePath } = await this.s3Service.uploadFileFromBuffer(
        file.buffer,
        `comics/${updatedComic.id}`,
        'thumb.jpeg',
      );

      updatedComic.thumb = relativePath;
    }

    return this.datasource.transaction(async (manager) => {
      const comic = await manager.getRepository(Comic).save(updatedComic);

      this.elasticsearchAdapter.updateRecord<Comic>('comics', comic.id, comic);

      return comic;
    });
  }

  async increaseViewForComic(comicId: number) {
    await this.getComicById(comicId);
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
    await this.getComicById(comicId);
    const chapter = this.chapterService.getSpecificChapterOfComicWithPreviousAndNextChapter(
      comicId,
      chapterId,
    );

    return chapter;
  }

  async commentOnComic(userId: number, comicId: number, content: string) {
    const comic = await this.getComicById(comicId);
    return this.commentService.createNewComment(userId, comic, content);
  }

  async getComicsCreatedByCreator(userId: number) {
    return this.comicRepository.getComicsByCreator(userId);
  }
}
