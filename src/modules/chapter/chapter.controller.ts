import { Controller } from '@nestjs/common';
import { ChapterService } from './chapter.service';

@Controller('api/chapter')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}
}
