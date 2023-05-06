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

  async getAll(query: any) {
    let page = 1;

    if (query.page) {
      page = query.page;
    }

    return await this.comicRepository
      .createQueryBuilder('comic')
      .orderBy('comic.updatedAt', 'DESC')
      .skip((page - 1) * 12)
      .take(12)
      .getMany();
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

    return await this.getOne(name_comic);
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

    if (!query.get_total) {
      result.skip((page - 1) * 18).take(18);
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
      result.andWhere("array_to_string(comics.genres, ',') like :genres", {
        genres: `%${query.filter_genre}%`,
      });
    }

    return result.getMany();
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

  @Interval(1000 * 60 * 30)
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

  @Interval(1000 * 60 * 15)
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
