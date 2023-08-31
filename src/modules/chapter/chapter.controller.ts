import { Controller, Get, HttpStatus, Logger, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { Response } from 'express';

@Controller('api/chapter')
export class ChapterController {
  constructor(
    private logger: Logger = new Logger(ChapterController.name),
    private chapterService: ChapterService,
  ) {}

  @Get('/get/:id_comic/:id_chapter')
  async getOneChapter(
    @Param('id_chapter', new ParseIntPipe()) id_chapter,
    @Param('id_comic', new ParseIntPipe()) id_comic,
    @Res() response: Response,
  ) {
    try {
      const chapters = await this.chapterService.getAll(id_comic);
      const chapter = this.chapterService.getNextAndPreChapter(id_chapter, chapters);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: chapter,
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: 'Lỗi!',
      });
    }
  }
}
