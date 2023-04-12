import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { ComicService } from './comic.service';
import { Response } from 'express';
import { ChapterService } from '../chapter/chapter.service';

@Controller('api/comic')
export class ComicController {
  constructor(
    private comicService: ComicService,
    private chapterService: ChapterService,
  ) {}

  @Get()
  async getAllComic(@Query() query: any, @Res() response: Response) {
    try {
      const temp_comics = await this.comicService.getAll(query);

      const comics = [];

      for (const comic of temp_comics) {
        const chapter_newest = await this.chapterService.getNewestChapter(
          comic.id,
        );

        const temp_comic = {
          ...comic,
          new_chapter: chapter_newest,
        };

        comics.push(temp_comic);
      }
      const total = await this.comicService.getTotal();

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'get all comic successfully!',
        result: comics,
        total: total,
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get('/genres')
  async getGenres(@Res() response: Response) {
    try {
      const genres = await this.comicService.getGenres();
      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tăng thành công!',
        result: genres,
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get('/ranking')
  async getRanking(@Query() query: any, @Res() response: Response) {
    try {
      const comics = await this.comicService.ranking(query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'get all comic successfully!',
        result: comics,
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get('/search')
  async search(@Query() query: any, @Res() response: Response) {
    try {
      const comics = await this.comicService.search(query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tìm kiếm thành công!',
        result: comics ? comics : [],
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get(':name')
  async getComic(@Param('name') name_comic: string, @Res() response: Response) {
    try {
      const comic = await this.comicService.getOne(name_comic);
      const chapters = await this.chapterService.getAll(comic.id);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'get all comic successfully!',
        result: {
          comic,
          chapters,
        },
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get(':name/increment')
  async increament(
    @Query() query: any,
    @Param('name') slug_comic: string,
    @Res() response: Response,
  ) {
    try {
      await this.comicService.increment(
        slug_comic,
        query.field,
        parseInt(query.jump),
      );

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tăng thành công!',
        result: {},
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }
}
