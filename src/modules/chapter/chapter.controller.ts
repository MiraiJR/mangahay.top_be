import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { AuthGuard } from '@common/guards/auth.guard';
import { UserRole } from '../user/user.role';
import { Roles } from '@common/guards/role.guard';

@Controller('api/chapters')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @Get('/:id')
  async handleGetChapter(@Param('id') chapterId) {
    return this.chapterService.getChapter(chapterId);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @Patch('/reorder')
  async handleReorderChapters() {
    await this.chapterService.reorderChapters();

    return 'Sắp xếp lại các chapter thành công!';
  }
}
