import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { UpdateChapterRequest } from './dtos/update-chapter.request';
import { ReorderChapterBody } from './dtos/reorder-chapter.request';

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

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Patch('reorder')
  async handleReorderListChapter(
    @UserId() operatorId: number,
    @Body(new ValidationPipe()) incomingData: ReorderChapterBody,
  ) {
    await this.chapterComicFacade.reorderedListChapter(operatorId, incomingData);

    return 'Cập nhật thứ tự chương thành công!';
  }

  @Get('/:slug')
  handleGetChapter(@Param('slug') slug: string) {
    return this.chapterService.getChapterBySlug(slug);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Delete('/:chapterId')
  async handleDeleteSingleChapter(
    @UserId() operatorId: number,
    @Param('chapterId') chapterId: number,
  ) {
    await this.chapterComicFacade.deleteSingleChapter(operatorId, chapterId);
    return `Delete chapter id [${chapterId}] successfully!`;
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @Put('/:chapterId')
  @UseInterceptors(
    FilesInterceptor('newImages', 1000, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  handleUpdateChapter(
    @UserId() operatorId: number,
    @Param('chapterId') chapterId: number,
    @UploadedFiles() newImages: Express.Multer.File[],
    @Body(new ValidationPipe()) inputData: UpdateChapterRequest,
  ) {
    return this.chapterComicFacade.updateChapter(operatorId, chapterId, inputData, newImages);
  }

  @UseGuards(AuthGuard, RoleGuard)
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
