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

@Controller('api/chapters')
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
    private readonly chapterComicFacade: ChapterComicFacade,
  ) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.TRANSLATOR)
  @UseInterceptors(FilesInterceptor('images'))
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
}
