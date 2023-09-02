import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { Response } from 'express';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdUser } from '../user/decorators/id-user';
import { Roles, RolesGuard } from '../../common/guards/check-role';
import { UserRole } from '../user/user.role';
import { CreateComicDTO } from './DTO/create-comic';
import { RedisService } from '../redis/redis.service';

@Controller('api/comic')
export class ComicController {
  constructor(private comicService: ComicService, private redisService: RedisService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handleGetComics(@Query() query: { page: number; limit: number }) {
    const comics = await this.comicService.getComics(query);
    const total = await this.comicService.countComics();

    return {
      comics,
      total,
    };
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async handleCreateComic(
    @Body(new ValidationPipe()) comic: CreateComicDTO,
    @IdUser() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const newComic = await this.comicService.createComic(comic, file);

    return newComic;
  }

  @Put('/:comicId')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpdateComic(
    @Body(new ValidationPipe()) comic: CreateComicDTO,
    @IdUser() useId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updatedComic = await this.comicService.updateComic({ ...comic, id: comicId }, file);

    return updatedComic;
  }

  @Get('/genres')
  async handleGetGenres() {
    const genres = await this.comicService.getGenres();

    return genres;
  }

  @Get('/ranking')
  async handleGetRanking(@Query() query: { field: string; limit: string }) {
    const comics = await this.comicService.ranking(query);

    return comics;
  }

  @Get('/search')
  async handleSearch(@Query() query: QuerySearch) {
    const comics = await this.comicService.search(query);

    return comics;
  }

  @Get(':slug')
  async handleGetComic(@Param('slug') slugComic: string) {
    const comic = await this.comicService.getComicBySlug(slugComic);

    return comic;
  }

  @Get('chapter/:comicId')
  async handleGetChaptersOfComic(@Param('comicId', new ParseIntPipe()) comicId: number) {
    const chapters = await this.comicService.getChapters(comicId);

    return chapters;
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('delete/:comicId')
  async handleDeleteComic(@Param('comicId', new ParseIntPipe()) comicId: number) {
    await this.comicService.delete(comicId);

    return `Xóa truyện với id ${comicId} thành công!`;
  }

  @Get(':slugComic/increment')
  async handleIncreament(
    @Query() query: { field: string; jump: number },
    @Param('slugComic') slugComic: string,
  ) {
    await this.comicService.increment(slugComic, query.field, query.jump);

    return `Tăng [${query.field}] cho truyện thành công!`;
  }
}
