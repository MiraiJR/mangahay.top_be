import { Injectable, Logger } from '@nestjs/common';
import { Comic } from './comic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Genres } from './genre/genre.entity';
import { Interval } from '@nestjs/schedule';
import { spawn } from 'child_process';
import { IComic } from './comic.interface';
import { User_Evaluate_Comic } from '../user/user_evaluate/user_evaluate.entity';
import * as moment from 'moment';

@Injectable()
export class ComicService {
  constructor(
    private logger: Logger = new Logger(ComicService.name),
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(Genres)
    private genresRepository: Repository<Genres>,
    @InjectRepository(User_Evaluate_Comic)
    private userEvaluateComicRepository: Repository<User_Evaluate_Comic>,
  ) {}

  async create(comic: IComic) {
    const new_comic = this.comicRepository.create(comic);
    return await this.comicRepository.save(new_comic);
  }

  async delete(id_comic: number) {
    return await this.comicRepository.delete(id_comic);
  }

  async update(comic: IComic) {
    return await this.comicRepository.save({
      id: comic.id,
      ...comic,
    });
  }

  async getAllComic() {
    return await this.comicRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getAll(query: any) {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    return await this.comicRepository.manager.query(
      `
      select co_2.id, co_2.slug, co_2.name,co_2.another_name, co_2.genres,co_2.authors,co_2.state, co_2.thumb,co_2.brief_desc, co_2.view, co_2.like, co_2.follow, co_2.star, co_2.id_owner, co_2."createdAt", co_2."updatedAt", ch_2.name as "newest_chapter_name", ch_2.slug as "newest_chapter_slug", co_ch.id_chapter as "newest_chapter_id"
      from (select co.id,max(ch.id) as id_chapter
      from public.comic as co join public.chapter ch on co.id = ch.id_comic
      group by co.id) as co_ch join public.comic co_2 on co_ch.id = co_2.id
      join public.chapter as ch_2 on co_ch.id_chapter = ch_2.id
      order by co_2."updatedAt" DESC
      offset ${(page - 1) * query.limit}
      limit ${query.limit}
      `,
    );
    // .createQueryBuilder('comic')
    // .skip((page - 1) * query.limit)
    // .take(query.limit)
    // .orderBy('comic.updatedAt', 'DESC')
    // .getMany();
  }

  async getTotal() {
    return await this.comicRepository.count();
  }

  async getOne(name_comic: string) {
    return await this.comicRepository
      .createQueryBuilder('comic')
      .where('comic.slug = :slug', { slug: name_comic })
      .getOne();
  }

  async getById(id_comic: number) {
    return this.comicRepository.findOne({
      where: {
        id: id_comic,
      },
    });
  }

  // tăng các field như view, follow, like
  async increment(name_comic: string, field: string, jump: number) {
    await this.comicRepository.increment(
      {
        slug: name_comic,
      },
      `${field}`,
      jump,
    );
  }

  async search(query: any) {
    let page = 1;

    if (query.page) {
      page = parseInt(query.page);
    }

    const result = await this.comicRepository.createQueryBuilder('comics');

    if (query.comic_name != '') {
      const data_search_slug = slugify(query.comic_name, {
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

    if (query.filter_state != '') {
      result.andWhere('comics.state = :state', { state: query.filter_state });
    }

    if (query.filter_sort == 'az') {
      result.orderBy('comics.name', 'ASC');
    } else if (query.filter_sort == 'za') {
      result.orderBy('comics.name', 'DESC');
    } else {
      result.orderBy(`comics.${query.filter_sort}`, 'DESC');
    }

    if (query.filter_author != '') {
      result.andWhere(':author = any(comics.authors)', {
        author: query.filter_author,
      });
    }

    if (query.filter_genre != '') {
      let query_filter: any = `genres @> ARRAY[${query.filter_genre}]`
        .replace('[', "['")
        .replace(']', "']");

      query_filter = query_filter.replaceAll(',', "','");
      result.andWhere(query_filter);
    }

    return {
      total: await result.getCount(),
      comics: await result
        .skip((page - 1) * Number.parseInt(query.limit))
        .take(Number.parseInt(query.limit))
        .getMany(),
    };
  }

  async ranking(query: any) {
    return await this.comicRepository
      .createQueryBuilder('comics')
      .orderBy(`comics.${query.field}`, 'DESC')
      .limit(parseInt(query.limit))
      .getMany();
  }

  async getGenres() {
    return await this.genresRepository.find();
  }

  async updateThumb(id_comic: number, thumb: string) {
    return await this.comicRepository.save({
      id: id_comic,
      thumb: thumb,
    });
  }

  async updateRatingStar(id_comic: number, number_rating: number) {
    const comic = await this.getById(id_comic);
    const number_user_rating = await this.userEvaluateComicRepository.count({
      where: {
        id_comic: id_comic,
      },
    });

    const new_rating =
      (comic.star * (number_user_rating - 1) + number_rating) /
      number_user_rating;

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
      const temp_date = moment()
        .subtract(i, 'days')
        .startOf('day')
        .format('yyyy-MM-DD');

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
      const temp_date = moment()
        .subtract(i, 'days')
        .startOf('day')
        .format('yyyy-MM-DD');

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
    const link_file_python: string =
      process.cwd() + '/src/common/pythons/update_chapter_auto.py';
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
    const link_file_python: string =
      process.cwd() + '/src/common/pythons/update_new_comic.py';
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
