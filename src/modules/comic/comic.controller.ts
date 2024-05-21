import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
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
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles, RolesGuard } from '../../common/guards/check-role';
import { UserRole } from '../user/user.role';
import { CreateComicDTO } from './dtos/create-comic';
import { RedisService } from '../redis/redis.service';
import UserId from '../user/decorators/userId';
import { GetComicsDTO } from './dtos/getComics';
import { ScoreDTO } from './dtos/evaluateComic';
import { CreateChapterDTO } from '../chapter/dtos/create-chapter';
import { CreateCommentDTO } from '../comment/dtos/create-comment';
import { CreateAnswerDTO } from '../answer-comment/dtos/create-answer';
import { IncreaseFieldDTO } from './dtos/increaseField';
import { CrawlChapterDTO } from './dtos/crawlChapter';
import { CrawlAllChaptersDTO } from './dtos/crawlAllChapters';
import { UpdateComicDTO } from './dtos/update-comic';
import { CrawlChaptersReq } from './dtos/crawl-chapters.request';

@Controller('api/comics')
export class ComicController {
  constructor(private comicService: ComicService, private redisService: RedisService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handleGetComics(
    @Query(new ValidationPipe())
    query: GetComicsDTO,
  ) {
    return this.comicService.getComics(query);
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async handleCreateComic(
    @Body(new ValidationPipe()) comic: CreateComicDTO,
    @UserId() creatorId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const newComic = await this.comicService.createComic(creatorId, comic, file);

    return newComic;
  }

  @UseGuards(JwtAuthorizationd)
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

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':comicId')
  async handleDeleteComic(@Param('comicId', new ParseIntPipe()) comicId: number) {
    await this.comicService.delete(comicId);

    return `Xóa truyện với id ${comicId} thành công!`;
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
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

  @UseGuards(JwtAuthorizationd)
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

  @UseGuards(JwtAuthorizationd)
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

  @UseGuards(JwtAuthorizationd)
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

  @Patch(':comicId/increment')
  async handleIncreament(
    @Query(new ValidationPipe()) query: IncreaseFieldDTO,
    @Param('comicId') comicId: number,
  ) {
    await this.comicService.increaseTheNumberViewOrFollowOrLike(comicId, query.field, query.jump);

    return `Tăng [${query.field}] cho truyện thành công!`;
  }

  @UseGuards(JwtAuthorizationd)
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

  @UseGuards(JwtAuthorizationd, RolesGuard)
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

  @UseGuards(JwtAuthorizationd)
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

  @UseGuards(JwtAuthorizationd)
  @Post(':comicId/comments/:commentId/answer')
  async handleReplyComment(
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @UserId() userId: number,
    @Body(new ValidationPipe()) data: CreateAnswerDTO,
  ) {
    const { content, mentionedPerson } = data;
    await this.comicService.addAnswerToCommentOfComic(
      userId,
      comicId,
      commentId,
      content,
      mentionedPerson,
    );

    return `Trả lời bình luận thành công!`;
  }
}
