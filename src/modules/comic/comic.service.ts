import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IComic } from './comic.interface';
import { ChapterService } from '../chapter/chapter.service';
import { ComicRepository } from './comic.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Comic } from './comic.entity';
import { ComicInteractionService } from '../comic-interaction/comicInteraction.service';
import { NotificationService } from '../notification/notification.service';
import { INotification } from '../notification/notification.interface';
import { CommentService } from '../comment/comment.service';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Helper from 'src/common/utils/helper';
import { ConfigService } from '@nestjs/config';
import { Paging, PagingComics } from 'src/common/types/Paging';
import { UPDATE_IMAGE_WITH_FILE_OR_NOT, UpdateComicDTO } from './dtos/update-comic';
import { DataSource, EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { GoogleApiService } from '../google-api/google-api.service';

@Injectable()
export class ComicService {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private notifyService: NotificationService,
    private logger: Logger = new Logger(ComicService.name),
    private chapterService: ChapterService,
    private comicRepository: ComicRepository,
    private cloudinaryService: CloudinaryService,
    private comicInteractionService: ComicInteractionService,
    private commentService: CommentService,
    private httpService: HttpService,
    private configService: ConfigService,
    private readonly databaseConnection: DataSource,
    private readonly googleApiService: GoogleApiService,
  ) {}

  async getComicsWithChapters() {
    return this.comicRepository.findComicsWithChapters();
  }

  async crawlChaptersFromWebsite(
    userId: number,
    comicId: number,
    urls: string,
    querySelector: string,
    attribute: string,
  ) {
    const arrayUrl = urls.split(',');
    for (let _index = 0; _index < arrayUrl.length; _index++) {
      const nameChapter = arrayUrl[_index].split('/').reverse()[0].split('-').join(' ');

      try {
        await this.crawlChapterForComic(
          userId,
          comicId,
          nameChapter,
          arrayUrl[_index],
          querySelector,
          attribute,
        );
      } catch (error) {
        continue;
      }
    }
  }

  async crawlImagesFromLinkWebsite(urlPost: string, querySelector: string, attribute: string) {
    const response = await axios.get(urlPost);
    const $ = cheerio.load(response.data);
    const imgElements = $(querySelector);

    const srcAttributes = imgElements.map((_index, element) => $(element).attr(attribute)).get();

    if (urlPost.includes('blogtruyen')) {
      srcAttributes.shift();
      srcAttributes.pop();
    }

    return srcAttributes;
  }

  async crawlImagesFromFacebookPost(urlPost: string) {
    const convertedURL = new URL(urlPost);
    const pageId = convertedURL.searchParams.get('id');
    const postId = convertedURL.searchParams.get('story_fbid');
    const accessToken = this.configService.get<string>('FACEBOOK_TOKEN');

    const { data } = await this.httpService
      .get(
        `https://graph.facebook.com/v18.0/${pageId}_${postId}?fields=attachments{subattachments.limit(100)}&access_token=${accessToken}`,
      )
      .toPromise();

    if (data.attachments === undefined) {
      throw new HttpException('Cannot crawl data from this link!', HttpStatus.BAD_REQUEST);
    }

    const images: string[] = [];
    data.attachments.data[0].subattachments.data.map((ele: any) => {
      images.push(ele.media.image.src);
    });

    return images;
  }

  async crawlChapterForComic(
    userId: number,
    comicId: number,
    nameChapter: string,
    urlPost: string,
    querySelector: string,
    attribute: string,
  ) {
    const comic = await this.getComicById(comicId);

    if (!comic) {
      throw new HttpException('Truyện không tồn tại!', HttpStatus.NOT_FOUND);
    }

    let crawledImages = [];

    if (urlPost.includes('facebook')) {
      crawledImages = await this.crawlImagesFromFacebookPost(urlPost);
    } else {
      crawledImages = await this.crawlImagesFromLinkWebsite(urlPost, querySelector, attribute);
    }

    if (crawledImages.length === 0) {
      throw new HttpException('Lỗi không crawl được dữ liệu!', HttpStatus.BAD_REQUEST);
    }

    const order = nameChapter.match(/[+-]?\d+(\.\d+)?/g)[0] ?? null;

    if (!order) {
      throw new HttpException(
        'Vui lòng điền tên chapter chưa một số hoặc số thập phân!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.manager.transaction(async (manager) => {
      try {
        const newChapter = await this.chapterService.createNewChapterWithoutFiles(
          {
            name: nameChapter,
            comicId,
            creator: userId,
            order: parseFloat(order),
          },
          manager,
        );

        const newChapterUrl = `${this.configService.get<string>('HOST_FE')}/truyen/${comic.slug}/${
          newChapter.slug
        }`;
        this.googleApiService.indexingUrl(newChapterUrl);

        let imagesChapter = [];

        for (let _index = 0; _index < crawledImages.length; _index++) {
          const folder = `${comic.id}/${newChapter.id}`;
          const imageName = `${_index}`;

          const linkImage = await this.cloudinaryService.uploadImageFromUrl(
            crawledImages[_index],
            folder,
            imageName,
          );

          imagesChapter.push(linkImage);
        }

        if (imagesChapter.length === 0) {
          throw new HttpException(
            'Lỗi không crawl được dữ liệu hoặc trang web được crawl đã chặn quyền!',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (imagesChapter.length === crawledImages.length) {
          await this.chapterService.update(
            {
              ...newChapter,
              images: Helper.sortArrayImages(imagesChapter),
            },
            manager,
          );

          await manager.query('COMMIT');
        }

        await this.comicRepository.updateTimeForComic(comicId);

        const listUserId = await this.comicInteractionService.getListUserIdFollowedComic(comicId);
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

        return newChapter;
      } catch (error) {
        await manager.query('ROLLBACK');
        throw new HttpException(
          'Lỗi không crawl được dữ liệu hoặc trang web được crawl đã chặn quyền!',
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  }

  async getChapters(comicId: number) {
    return await this.chapterService.getChaptersOfComic(comicId);
  }

  async delete(comicId: number) {
    const comic = await this.getComicById(comicId);

    if (!comic) {
      throw new HttpException(`Cannot found comic with id [${comicId}]`, HttpStatus.NOT_FOUND);
    }

    return await this.comicRepository.delete(comicId);
  }

  async getComics(query: Paging) {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    const result = await this.comicRepository.getComicsWithPagination(
      page,
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
    return await this.comicRepository.findOne({
      where: {
        slug: slugComic,
      },
      order: {
        chapters: {
          order: 'DESC',
        },
      },
    });
  }

  async getComicById(comicId: number): Promise<Comic> {
    const comic = await this.comicRepository.findOne({
      where: {
        id: comicId,
      },
      order: {
        chapters: {
          order: 'DESC',
        },
      },
    });

    return comic;
  }

  async createComic(creator: number, comic: IComic, file: Express.Multer.File): Promise<Comic> {
    let newComic = this.comicRepository.create({
      ...comic,
      creator,
    });

    newComic = await this.comicRepository.save(newComic);
    const urlOfNewComic = `${this.configService.get<string>('HOST_FE')}/truyen/${newComic.slug}`;
    this.googleApiService.indexingUrl(urlOfNewComic);

    this.cloudinaryService
      .uploadFileFromBuffer(file.buffer, `comics/${newComic.id}/thumb`)
      .then((data: any) => {
        return this.updateThumb(newComic.id, data.url);
      });

    return newComic;
  }

  async checkCreatorOfComic(userId: number, comicId: number): Promise<boolean> {
    const comic = await this.getComicById(comicId);

    if (!comic.creator || comic.creator === userId) {
      return true;
    }

    throw new HttpException('Bạn không phải người tạo truyện này!', HttpStatus.FORBIDDEN);
  }

  async updateComic(
    userId: number,
    comicId: number,
    data: UpdateComicDTO,
    file: Express.Multer.File | null = null,
  ): Promise<Comic> {
    await this.checkCreatorOfComic(userId, comicId);

    let updatedComic = await this.getComicById(comicId);

    updatedComic.name = data.name;
    updatedComic.anotherName = data.anotherName;
    updatedComic.genres = data.genres;
    updatedComic.authors = data.authors;
    updatedComic.briefDescription = data.briefDescription;
    updatedComic.translators = data.translators;
    updatedComic.generateSlug();
    updatedComic.updateTimeStamp();

    updatedComic = await this.comicRepository.save(updatedComic);

    if (!file || data.isUpdateImage === UPDATE_IMAGE_WITH_FILE_OR_NOT.NO) {
      return updatedComic;
    }

    this.cloudinaryService
      .uploadFileFromBuffer(file.buffer, `comics/${updatedComic.id}/thumb`)
      .then((data: any) => {
        return this.updateThumb(updatedComic.id, data.url);
      });

    return updatedComic;
  }

  async increaseTheNumberViewOrFollowOrLike(comicId: number, field: string, jump: number) {
    const comic = await this.getComicById(comicId);

    await this.comicRepository.increment(
      {
        slug: comic.slug,
      },
      `${field}`,
      jump,
    );
  }

  async searchComics(query: QuerySearch): Promise<PagingComics> {
    return this.comicRepository.searchComics(query);
  }

  async ranking(query: { field: string; limit: number }) {
    const comics = await this.comicRepository.getComicsWithPagination(1, query.limit, query.field);

    return comics;
  }

  async updateThumb(comicId: number, thumb: string) {
    const comic = await this.getComicById(comicId);
    if (!comic) {
      throw new HttpException(`Truyên id [${comic.id}] không tồn tại!`, HttpStatus.BAD_REQUEST);
    }

    const newInformation = await this.comicRepository.save({
      id: comicId,
      thumb: thumb,
    });

    return {
      ...comic,
      thumb: newInformation.thumb,
    };
  }

  async evaluateComic(userId: number, comicId: number, score: number) {
    await this.comicInteractionService.evaluateComic(userId, comicId, score);

    const newRatingStar = await this.comicInteractionService.calculateEvaluatedRatingStar(comicId);

    return await this.comicRepository.save({
      id: comicId,
      star: newRatingStar,
    });
  }

  async addNewChapterForComic(
    userId: number,
    comicId: number,
    nameChapter: string,
    files: Express.Multer.File[],
  ) {
    const comic = await this.getComicById(comicId);

    if (!comic) {
      throw new HttpException('Truyện không tồn tại!', HttpStatus.NOT_FOUND);
    }

    if (userId !== comic.creator) {
      throw new HttpException(
        'Bạn không có quyền để tạo chapter mới cho truyện này!',
        HttpStatus.FORBIDDEN,
      );
    }

    const order = nameChapter.match(/[+-]?\d+(\.\d+)?/g)[0];
    const newChapter = await this.chapterService.createNewChapter(
      {
        name: nameChapter,
        comicId,
        creator: userId,
        order: parseFloat(order),
      },
      files,
    );
    const newChapterUrl = `${this.configService.get<string>('HOST_FE')}/truyen/${comic.slug}/${
      newChapter.slug
    }`;
    this.googleApiService.indexingUrl(newChapterUrl);

    await this.comicRepository.updateTimeForComic(comicId);

    const listUserId = await this.comicInteractionService.getListUserIdFollowedComic(comicId);
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

  async getASpecificChapterOfComic(comicId: number, chapterId: number) {
    const comic = await this.getComicById(comicId);
    if (!comic) {
      throw new HttpException('Truyện không tồn tại!', HttpStatus.NOT_FOUND);
    }

    const chapters = await this.chapterService.getChaptersOfComic(comicId);
    const chapter = this.chapterService.getNextAndPreChapter(chapterId, chapters);

    return chapter;
  }

  async commentOnComic(userId: number, comicId: number, content: string) {
    const comic = await this.getComicById(comicId);

    if (!comic) {
      throw new HttpException('Truyện không tồn tại!', HttpStatus.NOT_FOUND);
    }

    return this.commentService.createNewComment(userId, comic, content);
  }

  async addAnswerToCommentOfComic(
    userId: number,
    comicId: number,
    commentId: number,
    content: string,
    mentionedPerson: string,
  ): Promise<void> {
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) {
      throw new HttpException('Bình luận không tồn tại!', HttpStatus.NOT_FOUND);
    }

    if (comicId !== comment.comic.id) {
      throw new HttpException('Bình luận không thuộc truyện tranh này!', HttpStatus.BAD_REQUEST);
    }

    const comic = await this.getComicById(comment.comic.id);

    if (!comic) {
      throw new HttpException('Truyện không tồn tại!', HttpStatus.NOT_FOUND);
    }

    await this.commentService.addAnswerToComment({
      userId,
      commentId,
      mentionedPerson,
      content,
    });
  }

  async getComicsCreatedByCreator(userId: number) {
    return this.comicRepository.getComicsByCreator(userId);
  }
}
