import { Controller, Patch, UseGuards } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';
import { UserRole } from '../user/user.role';
import { Roles } from 'src/common/guards/check-role';

@Controller('api/chapters')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @UseGuards(JwtAuthorizationd)
  @Roles(UserRole.ADMIN)
  @Patch('/reorder')
  async handleReorderChapters() {
    await this.chapterService.reorderChapters();

    return 'Sắp xếp lại các chapter thành công!';
  }
}
