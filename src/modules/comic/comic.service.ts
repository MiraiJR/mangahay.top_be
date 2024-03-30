import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import slugify from 'slugify';
import { IComic } from './comic.interface';
import { ChapterService } from '../chapter/chapter.service';
import { ComicRepository } from './comic.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Comic } from './comic.entity';
import { ComicInteractionService } from '../comic-interaction/comicInteraction.service';
import { NotificationService } from '../notification/notification.service';
import { INotification } from '../notification/notification.interface';
import { CommentService } from '../comment/comment.service';
import { Chapter } from '../chapter/chapter.entity';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Helper from 'src/common/utils/helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ComicService {
  constructor(
    private notifyService: NotificationService,
    private logger: Logger = new Logger(ComicService.name),
    private chapterService: ChapterService,
    private comicRepository: ComicRepository,
    private cloudinaryService: CloudinaryService,
    private comicInteractionService: ComicInteractionService,
    private commentService: CommentService,
    private httpService: HttpService,
    private configService: ConfigService,
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

    const order = nameChapter.match(/[+-]?\d+(\.\d+)?/g)[0];

    const newChapter = await this.chapterService.createNewChapterWithoutFiles({
      name: nameChapter,
      comicId,
      creator: userId,
      order: parseFloat(order),
    });

    let imagesChapter = [];

    for (let _index = 0; _index < crawledImages.length; _index++) {
      const folder = `${comic.id}/${newChapter.id}`;
      const imageName = `${_index}`;

      try {
        const linkImage = await this.cloudinaryService.uploadImageFromUrl(
          crawledImages[_index],
          folder,
          imageName,
        );

        imagesChapter.push(linkImage);
      } catch (error) {
        await this.chapterService.delete(newChapter.id);
        throw new HttpException('Lỗi không crawl được dữ liệu!', HttpStatus.BAD_REQUEST);
      }

      if (imagesChapter.length === crawledImages.length) {
        await this.chapterService.update({
          ...newChapter,
          images: Helper.shortArrayImages(imagesChapter),
        });
      }
    }

    await this.update({
      ...comic,
      updatedAt: new Date(),
    });

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
  }

  async getChapters(comicId: number) {
    return await this.chapterService.getChaptersOfComic(comicId);
  }

  async delete(comicId: number) {
    const comic = await this.getComicById(comicId);

    await this.chapterService.deleteAllChapterOfComic(comicId);
    // await Promise.all([
    //   this.userService.deleteComicFromEvaluate(comicId),
    //   this.userService.deleteComicFromFollow(comicId),
    //   this.userService.deleteComicFromLike(comicId),
    // ]);

    return await this.comicRepository.delete(comicId);
  }

  async update(comic: IComic) {
    return await this.comicRepository.save({
      id: comic.id,
      ...comic,
    });
  }

  async getComics(query: { page: number; limit: number }) {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    const comics = await this.comicRepository.getComicsAndNewesttChapter(
      page,
      query.limit,
      'updatedAt',
    );
    return comics;
  }

  async countComics() {
    return await this.comicRepository.count();
  }

  async getComicBySlug(slugComic: string) {
    return await this.comicRepository
      .createQueryBuilder('comic')
      .where('comic.slug = :slug', { slug: slugComic })
      .getOne();
  }

  async getComicById(comicId: number): Promise<Comic> {
    const comic = await this.comicRepository.findOne({
      where: {
        id: comicId,
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

  async updateComic(userId: number, comic: IComic, file: Express.Multer.File): Promise<Comic> {
    await this.checkCreatorOfComic(userId, comic.id);

    let updatedComic = await this.getComicById(comic.id);

    updatedComic.name = comic.name;
    updatedComic.anotherName = comic.anotherName;
    updatedComic.genres = comic.genres;
    updatedComic.authors = comic.authors;
    updatedComic.briefDescription = comic.briefDescription;
    updatedComic.generateSlug();
    updatedComic.updateTimeStamp();

    updatedComic = await this.comicRepository.save(updatedComic);

    if (!file) {
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

  async searchComic(query: QuerySearch) {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    const result = this.comicRepository.createQueryBuilder('comics');

    if (query.comicName) {
      const dataSearchSlug = slugify(query.comicName, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'vi',
        trim: true,
      });

      result.where('comics.slug like :search', {
        search: `%${dataSearchSlug}%`,
      });
    }

    if (query.filterState) {
      result.andWhere('comics.state = :state', { state: query.filterState });
    }

    if (query.filterSort) {
      switch (query.filterSort) {
        case 'az':
          result.orderBy('comics.name', 'ASC');
          break;
        case 'za':
          result.orderBy('comics.name', 'DESC');
          break;
        default:
          result.orderBy(`comics.${query.filterSort}`, 'DESC');
          break;
      }
    }

    if (query.filterAuthor) {
      result.andWhere(':author = any(comics.authors)', {
        author: query.filterAuthor,
      });
    }

    if (query.filterGenres) {
      let query_filter: any = `genres @> ARRAY[${query.filterGenres}]`
        .replace('[', "['")
        .replace(']', "']");

      query_filter = query_filter.replaceAll(',', "','");
      result.andWhere(query_filter);
    }

    result
      .addOrderBy('comics.updatedAt', 'DESC')
      .leftJoinAndMapOne('comics.newestChapter', Chapter, 'chapter', 'chapter.comicId = comics.id')
      .select(['comics'])
      .addSelect(['chapter.name', 'chapter.slug', 'chapter.id']);

    const total = await result.getCount();

    let comics = await result.getMany();

    if (query.limit) {
      comics = await result
        .skip((page - 1) * query.limit)
        .take(query.limit)
        .getMany();
    }

    return {
      total,
      comics,
    };
  }

  async ranking(query: { field: string; limit: number }) {
    const comics = await this.comicRepository.getComicsAndNewesttChapter(
      1,
      query.limit,
      query.field,
    );

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

    await this.update({
      ...comic,
      updatedAt: new Date(),
    });

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

    return this.commentService.createNewComment({
      userId,
      comicId,
      content,
    });
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

    if (comicId !== comment.comicId) {
      throw new HttpException('Bình luận không thuộc truyện tranh này!', HttpStatus.BAD_REQUEST);
    }

    const comic = await this.getComicById(comment.comicId);

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
    const comics = await this.comicRepository.find({
      where: {
        creator: userId,
      },
    });

    return comics;
  }
}
