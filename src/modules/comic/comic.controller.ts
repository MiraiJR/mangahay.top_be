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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles, RoleGuard } from '../../common/guards/role.guard';
import { UserRole } from '../user/user.role';
import { CreateComicDTO } from './dtos/create-comic';
import UserId from '../../common/decorators/userId';
import { GetComicsDTO } from './dtos/get-comics';
import { ScoreDTO } from './dtos/evaluate-comic';
import { CreateChapterDTO } from '../chapter/dtos/create-chapter';
import { CreateCommentDTO } from '../comment/dtos/create-comment';
import { CrawlChapterDTO } from './dtos/crawlChapter';
import { CrawlAllChaptersDTO } from './dtos/crawlAllChapters';
import { UpdateComicDTO } from './dtos/update-comic';
import { CrawlChaptersReq } from './dtos/crawl-chapters.request';

@Controller('api/comics')
export class ComicController {
  constructor(private comicService: ComicService) {}

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
  @UseInterceptors(FileInterceptor('thumb'))
  @Post()
  async handleCreateComic(
    @Body(new ValidationPipe()) comic: CreateComicDTO,
    @UserId() creatorId: number,
    @UploadedFile() thumb: Express.Multer.File,
  ) {
    const newComic = await this.comicService.createComic(creatorId, comic, thumb);

    return newComic;
  }

  @UseGuards(AuthGuard)
  @Get('/created-by-me')
  async handleGetComicsCreatedByMe(@UserId() userId: number) {
    const comics = await this.comicService.getComicsCreatedByCreator(userId);

    return comics;
  }

  @Get('/ranking')
  async handleGetRanking(@Query() query: { field: string; limit: number }) {
    return this.comicService.ranking(query);
  }

  @Get('/search')
  async handleSearch(@Query() query: QuerySearch) {
    const result = await this.comicService.searchComics(query);

    return {
      page: query.page ?? 1,
      limit: query.limit,
      ...result,
    };
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
  @Roles(UserRole.ADMIN)
  @Delete(':comicId')
  async handleDeleteComic(@Param('comicId', new ParseIntPipe()) comicId: number) {
    await this.comicService.delete(comicId);

    return `Xóa truyện với id ${comicId} thành công!`;
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Put('/:comicId')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpdateComic(
    @Body(new ValidationPipe()) data: UpdateComicDTO,
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updatedComic = await this.comicService.updateComic(userId, comicId, data, file);

    return updatedComic;
  }

  @Get('/:comicId/chapters')
  async handleGetListChapter(@Param('comicId') comicId: number) {
    return this.comicService.getChapters(comicId);
  }

  @Get('/:comicId/comments')
  async handleGetListComment(@Param('comicId') comicId: number) {
    return this.comicService.getListCommentOfComic(comicId);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Post(':comicId/crawl-chapter')
  async handleCrawlChapterForComic(
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: CrawlChapterDTO,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const { nameChapter, urlPost, querySelector, attribute } = data;
    await this.comicService.crawlChapterForComic(
      userId,
      comicId,
      nameChapter,
      urlPost,
      querySelector,
      attribute,
    );

    return 'Cào dữ liệu thành công!';
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Post(':comicId/crawl-chapters')
  async handleCrawlChaptersForComic(
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: CrawlChaptersReq,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    this.comicService.crawlChaptersForComic(
      userId,
      comicId,
      data.urlComic,
      data.querySelectorChapterUrl,
      data.attributeChapterUrl,
      data.querySelectorChapterName,
      data.querySelectorImageUrl,
      data.attributeImageUrl,
    );

    return 'Quá trình cào dữ liệu đang được tiến hành và chúng tối sẽ gửi thông báo cho bạn khi thành công!';
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Post(':comicId/crawl-all-chapters')
  async handleCrawlAllChaptersForComic(
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: CrawlAllChaptersDTO,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const { querySelector, attribute, urls } = data;
    await this.comicService.crawlChaptersFromWebsite(
      userId,
      comicId,
      urls,
      querySelector,
      attribute,
    );

    return 'Cào dữ liệu thành công!';
  }

  @Patch(':comicId/viewed')
  async handleIncreament(@Param('comicId') comicId: number) {
    await this.comicService.increaseViewForComic(comicId);

    return `Tăng lượt xem cho truyện thành công!`;
  }

  @UseGuards(AuthGuard)
  @Patch(':comicId/evaluate')
  async handleEvaluateComic(
    @Body(new ValidationPipe()) data: ScoreDTO,
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const { score } = data;
    await this.comicService.evaluateComic(userId, comicId, score);

    return `Đánh giá truyện thành công!`;
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @UseInterceptors(FilesInterceptor('files'))
  @Post(':comicId/chapters')
  async handleCreateChapterForComic(
    @Body(new ValidationPipe()) data: CreateChapterDTO,
    @UserId() userId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const { nameChapter } = data;
    await this.comicService.addNewChapterForComic(userId, comicId, nameChapter, files);
    return `Tạo chapter với cho truyện id [${comicId}] thành công!`;
  }

  @Get(':comicId/chapters/:chapterId')
  async getOneChapter(
    @Param('chapterId', new ParseIntPipe()) chapterId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const chapter = await this.comicService.getASpecificChapterOfComic(comicId, chapterId);

    return chapter;
  }

  @UseGuards(AuthGuard)
  @Post(':comicId/comments')
  async handleCommentComic(
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: CreateCommentDTO,
  ) {
    const { content } = data;
    const newComment = await this.comicService.commentOnComic(userId, comicId, content);

    return newComment;
  }
}
