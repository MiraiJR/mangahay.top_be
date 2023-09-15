import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Genres } from './genre/genre.entity';
import { Interval } from '@nestjs/schedule';
import { spawn } from 'child_process';
import { IComic } from './comic.interface';
import { ChapterService } from '../chapter/chapter.service';
import { ComicRepository } from './comic.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Comic } from './comic.entity';
import { ComicInteractionService } from '../comic-interaction/comicInteraction.service';
import { NotificationService } from '../notification/notification.service';
import { INotification } from '../notification/notification.interface';
import { CommentService } from '../comment/comment.service';

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
    @InjectRepository(Genres)
    private genresRepository: Repository<Genres>,
  ) {}

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

    const comics = await this.comicRepository.getComicsAndNewtChapter(page, query.limit);
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

    const result = await this.comicRepository.createQueryBuilder('comics');

    if (query.comicName != '') {
      const data_search_slug = slugify(query.comicName, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'vi',
        trim: true,
      });

      result.where('comics.slug like :search', {
        search: `%${data_search_slug}%`,
      });
    }

    if (query.filterState != '') {
      result.andWhere('comics.state = :state', { state: query.filterState });
    }

    switch (query.filterSort) {
      case 'az':
        result.orderBy('comics.name', 'ASC');
        break;
      case 'za':
        result.orderBy('comics.name', 'DESC');
        break;
      default:
        result.orderBy(`comics.name`, 'DESC');
        break;
    }

    if (query.filterAuthor != '') {
      result.andWhere(':author = any(comics.authors)', {
        author: query.filterAuthor,
      });
    }

    if (query.filterGenres != '') {
      let query_filter: any = `genres @> ARRAY[${query.filterGenres}]`
        .replace('[', "['")
        .replace(']', "']");

      query_filter = query_filter.replaceAll(',', "','");
      result.andWhere(query_filter);
    }

    return {
      total: await result.getCount(),
      comics: await result
        .skip((page - 1) * query.limit)
        .take(query.limit)
        .getMany(),
    };
  }

  async ranking(query: { field: string; limit: string }) {
    return await this.comicRepository
      .createQueryBuilder('comics')
      .orderBy(`comics.${query.field}`, 'DESC')
      .limit(parseInt(query.limit))
      .getMany();
  }

  async getGenres() {
    return await this.genresRepository.find();
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

    const newChapter = await this.chapterService.createNewChapter(
      {
        name: nameChapter,
        comicId,
        creator: userId,
      },
      files,
    );

    const listUserId = await this.comicInteractionService.getListUserIdFollowedComic(comicId);
    for (const userId of listUserId) {
      const notify: INotification = {
        userId: userId,
        title: 'Chương mới!',
        body: `${comic.name} vừa cập nhật thêm chapter mới - ${newChapter.name}.`,
        redirectUrl: `/comic/${comic.slug}/${newChapter.slug}`,
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

  @Interval(1000 * 60 * 120)
  automaticUpdate() {
    const link_file_python: string = process.cwd() + '/src/common/pythons/update_chapter_auto.py';
    const pyProg = spawn('python', [link_file_python]);

    this.logger.log('Cập nhật chapter mới cho truyện có sẵn!!!!!!!!!');

    pyProg.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    pyProg.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
  }

  @Interval(1000 * 60 * 60)
  automaticUpdateComic() {
    const link_file_python: string = process.cwd() + '/src/common/pythons/update_new_comic.py';
    const pyProg = spawn('python', [link_file_python]);

    this.logger.log('Cập nhật truyện mới!!!!!!!!!');

    pyProg.stdout.on('data', (data) => {
      this.logger.log(`stdout: ${data}`);
    });

    pyProg.stderr.on('data', (data) => {
      this.logger.log(`stderr: ${data}`);
    });
  }
}
