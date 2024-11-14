import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { UserRole } from '../user/user.role';
import { RoleGuard, Roles } from '@common/guards/role.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateChapterDTO } from './dtos/create-chapter';
import UserId from '@common/decorators/userId';
import { ChapterComicFacade } from './facades/chapter-comic.facade';
import { MAX_FILE_SIZE } from '@common/constant/Constant';
import { CrawlChapterDTO } from './dtos/crawl-chapter';

@Controller('api/chapters')
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
    private readonly chapterComicFacade: ChapterComicFacade,
  ) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @UseInterceptors(
    FilesInterceptor('images', 1000, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @Post()
  async handleCreateChapter(
    @Body(new ValidationPipe()) inputData: CreateChapterDTO,
    @UserId() userId: number,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    await this.chapterComicFacade.createChapter(inputData, images, userId);
    return `Tạo chapter với cho truyện id [${inputData.comicId}] thành công!`;
  }

  @Get('/:slug')
  async handleGetChapter(@Param('slug') slug: string) {
    return this.chapterService.getChapterBySlug(slug);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch('/reorder')
  async handleReorderChapters() {
    await this.chapterService.reorderChapters();

    return 'Sắp xếp lại các chapter thành công!';
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Post('crawl/single')
  async handleCrawlChapterForComic(
    @Body(new ValidationPipe()) incomingData: CrawlChapterDTO,
    @UserId() userId: number,
  ) {
    await this.chapterComicFacade.crawlSingleChapter(userId, incomingData);

    return 'Cào dữ liệu thành công!';
  }
}
