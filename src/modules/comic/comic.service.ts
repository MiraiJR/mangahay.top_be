import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Genres } from './genre/genre.entity';
import { Interval } from '@nestjs/schedule';
import { spawn } from 'child_process';
import { IComic } from './comic.interface';
import { User_Evaluate_Comic } from '../user/user_evaluate/user_evaluate.entity';
import * as moment from 'moment';
import { ChapterService } from '../chapter/chapter.service';
import { UserService } from '../user/user.service';
import { ComicRepository } from './comic.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Comic } from './comic.entity';

@Injectable()
export class ComicService {
  constructor(
    private userService: UserService,
    private logger: Logger = new Logger(ComicService.name),
    private chapterService: ChapterService,
    private comicRepository: ComicRepository,
    private cloudinaryService: CloudinaryService,
    @InjectRepository(Genres)
    private genresRepository: Repository<Genres>,
    @InjectRepository(User_Evaluate_Comic)
    private userEvaluateComicRepository: Repository<User_Evaluate_Comic>,
  ) {}

  async getChapters(comicId: number) {
    return await this.chapterService.getChaptersOfComic(comicId);
  }

  async delete(comicId: number) {
    const comic = await this.getComicById(comicId);

    if (!comic) {
      throw new HttpException(`Truyên id [${comicId}] không tồn tại!`, HttpStatus.BAD_REQUEST);
    }

    await this.chapterService.deleteAllChapterOfComic(comicId);
    await Promise.all([
      this.userService.deleteComicFromEvaluate(comicId),
      this.userService.deleteComicFromFollow(comicId),
      this.userService.deleteComicFromLike(comicId),
    ]);

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

  async getComicById(id_comic: number): Promise<Comic> {
    return this.comicRepository.findOne({
      where: {
        id: id_comic,
      },
    });
  }

  async createComic(comic: IComic, file: Express.Multer.File): Promise<Comic> {
    let newComic = await this.comicRepository.save(comic);

    newComic = await this.cloudinaryService
      .uploadFileFromBuffer(file.buffer, `comics/${newComic.id}/thumb`)
      .then((data: any) => {
        return this.updateThumb(newComic.id, data.url);
      });

    return newComic;
  }

  async updateComic(comic: IComic, file: Express.Multer.File): Promise<Comic> {
    let updatedComic = await this.getComicById(comic.id);

    if (!updatedComic) {
      throw new HttpException(`Truyện id [${comic.id}] không tồn tại!`, HttpStatus.BAD_REQUEST);
    }

    updatedComic.name = comic.name;
    updatedComic.another_name = comic.another_name;
    updatedComic.genres = comic.genres;
    updatedComic.authors = comic.authors;
    updatedComic.brief_desc = comic.brief_desc;
    updatedComic.generateSlug();
    updatedComic.updateTimeStamp();

    updatedComic = await this.comicRepository.save(updatedComic);

    if (!file) {
      return updatedComic;
    }

    updatedComic = await this.cloudinaryService
      .uploadFileFromBuffer(file.buffer, `comics/${updatedComic.id}/thumb`)
      .then((data: any) => {
        return this.updateThumb(updatedComic.id, data.url);
      });

    return updatedComic;
  }

  // tăng các field như view, follow, like
  async increment(slugComic: string, field: string, jump: number) {
    const comic = await this.getComicBySlug(slugComic);

    if (!comic) {
      throw new HttpException(`Truyên slug [${slugComic}] không tồn tại!`, HttpStatus.BAD_REQUEST);
    }

    await this.comicRepository.increment(
      {
        slug: comic.slug,
      },
      `${field}`,
      jump,
    );
  }

  async search(query: QuerySearch) {
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

  async updateRatingStar(id_comic: number, number_rating: number) {
    const comic = await this.getComicById(id_comic);
    const number_user_rating = await this.userEvaluateComicRepository.count({
      where: {
        id_comic: id_comic,
      },
    });

    const new_rating = (comic.star * (number_user_rating - 1) + number_rating) / number_user_rating;

    return await this.comicRepository.save({
      id: id_comic,
      star: new_rating,
    });
  }

  async analysisDayAgo(number_day: number) {
    const analysis = await this.comicRepository.manager.query(
      `select COUNT(id) as "count", DATE("createdAt")
      from public."comic"
      where DATE("createdAt") between DATE('${moment()
        .subtract(number_day, 'days')
        .startOf('day')
        .format('yyyy-MM-DD')}') AND DATE('${moment().format('yyyy-MM-DD')}')
      group by DATE("createdAt")`,
    );

    const result = [];

    for (let i = number_day - 1; i >= 0; i--) {
      const temp_date = moment().subtract(i, 'days').startOf('day').format('yyyy-MM-DD');

      const check = analysis.filter(
        (ele: any) => moment(ele.date).format('yyyy-MM-DD') === temp_date,
      );

      if (check.length !== 0) {
        result.push({
          date: temp_date,
          value: parseInt(check[0].count),
        });
      } else {
        result.push({
          date: temp_date,
          value: 0,
        });
      }
    }

    return result;
  }

  async compareCurDateAndPreDate() {
    const analysis = await this.comicRepository.manager.query(
      `select COUNT(id) as "count", DATE("createdAt")
      from public."comic"
      where DATE("createdAt") between DATE('${moment()
        .subtract(1, 'days')
        .startOf('day')
        .format('yyyy-MM-DD')}') AND DATE('${moment().format('yyyy-MM-DD')}')
      group by DATE("createdAt")`,
    );

    const result = [];

    for (let i = 1; i >= 0; i--) {
      const temp_date = moment().subtract(i, 'days').startOf('day').format('yyyy-MM-DD');

      const check = analysis.filter(
        (ele: any) => moment(ele.date).format('yyyy-MM-DD') === temp_date,
      );

      if (check.length !== 0) {
        result.push({
          date: temp_date,
          value: parseInt(check[0].count),
        });
      } else {
        result.push({
          date: temp_date,
          value: 0,
        });
      }
    }

    let percent_increment = 0;

    if (result[0].value !== 0) {
      percent_increment = (result[1].value - result[0].value) / result[0].value;
    } else {
      if (result[1].value === 0) {
        percent_increment = 0;
      } else {
        percent_increment = 1;
      }
    }

    percent_increment = percent_increment ? percent_increment * 100 : 0;

    return {
      increase: result[1].value - result[0].value,
      percent_increment: percent_increment.toFixed(2),
      is_increase: percent_increment >= 0 ? true : false,
    };
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
