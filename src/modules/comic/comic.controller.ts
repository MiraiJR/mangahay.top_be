import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles, RoleGuard } from '../../common/guards/role.guard';
import { UserRole } from '../user/user.role';
import { CreateComicRequest } from './dtos/create-comic';
import UserId from '../../common/decorators/user-id';
import { GetComicsDTO } from './dtos/get-comics';
import { EvaludateComicRequest } from './dtos/evaluate-comic';
import { UpdateComicRequest } from './dtos/update-comic';
import { CommentQuery } from './models/requests/comments.query';
import { GetChaptersRequest } from './dtos/get-chapters';
import { ReindexComicService } from './elasticsearch/services/reindex-comic.service';
import { GetRankingRequest } from './dtos/get-ranking';
import { MAX_FILE_SIZE } from '@common/constant';

@Controller('comics')
export class ComicController {
  constructor(
    private readonly comicService: ComicService,
    private readonly reindexComicService: ReindexComicService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handleGetComics(
    @Query(new ValidationPipe())
    query: GetComicsDTO,
  ) {
    return this.comicService.getComics(query);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @UseInterceptors(
    FileInterceptor('thumb', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @Post()
  handleCreateComic(
    @Body(new ValidationPipe()) inputData: CreateComicRequest,
    @UserId() creatorId: number,
    @UploadedFile() thumb: Express.Multer.File,
  ) {
    return this.comicService.createComic(creatorId, inputData, thumb);
  }

  @Get('/ranking')
  handleGetRanking(@Query(new ValidationPipe()) query: GetRankingRequest) {
    return this.comicService.ranking(query);
  }

  @Get('/chapters')
  async getComicsWithChapters() {
    const comicsWithChapters = await this.comicService.getComicsWithChapters();

    return comicsWithChapters;
  }

  @Get(':slug')
  async handleGetComic(@Param('slug') slugComic: string) {
    return this.comicService.getComicBySlug(slugComic);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Delete(':comicId')
  async handleDeleteComic(
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    await this.comicService.delete(userId, comicId);

    return `Xóa truyện với id ${comicId} thành công!`;
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @UseInterceptors(
    FileInterceptor('thumb', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @Put('/:comicId')
  async handleUpdateComic(
    @Body(new ValidationPipe()) inputData: UpdateComicRequest,
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @UploadedFile() thumb: Express.Multer.File,
  ) {
    const updatedComic = await this.comicService.updateComic(userId, comicId, inputData, thumb);

    return updatedComic;
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post('/elasticsearch/reindex')
  async handleReindexElasticsearch() {
    await this.reindexComicService.execute();
    return 'Đang tiến hành reindex toàn bộ truyện lên elasticsearch';
  }

  @Get('/:comicId/chapters')
  async handleGetListChapter(
    @Param('comicId') comicId: number,
    @Query(new ValidationPipe()) query: GetChaptersRequest,
  ) {
    return this.comicService.getChapters(comicId, query);
  }

  @Get('/:comicId/comments')
  async handleGetListComment(
    @Param('comicId') comicId: number,
    @Query(new ValidationPipe()) inputQuery: CommentQuery,
  ) {
    return this.comicService.getListCommentOfComic(comicId, inputQuery);
  }

  @Patch(':comicId/viewed')
  async handleIncreament(@Param('comicId') comicId: number) {
    await this.comicService.increaseViewForComic(comicId);

    return `Tăng lượt xem cho truyện thành công!`;
  }

  @UseGuards(AuthGuard)
  @Patch(':comicId/evaluate')
  async handleEvaluateComic(
    @Body(new ValidationPipe()) data: EvaludateComicRequest,
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const { score } = data;
    await this.comicService.evaluateComic(userId, comicId, score);

    return `Đánh giá truyện thành công!`;
  }
}
