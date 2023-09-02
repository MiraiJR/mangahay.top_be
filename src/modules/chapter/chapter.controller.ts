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
      const chapters = await this.chapterService.getChaptersOfComic(id_comic);
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

  // @UseGuards(JwtAuthorizationd, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @UseInterceptors(FilesInterceptor('files'))
  // @Post('/chapter/create')
  // async handleCreateChapterForComic(
  //   @Body(new ValidationPipe()) chapter: CreateChapterDTO,
  //   @IdUser() id_user: number,
  //   @Res() response: Response,
  //   @UploadedFiles() files: Express.Multer.File[],
  // ) {
  //   try {
  //     const new_chapter = await this.chapterService.create({ ...chapter });

  //     this.cloudinaryService
  //       .uploadMultipleFile(files, `comics/${new_chapter.id_comic}/${new_chapter.id}`)
  //       .then((data) => this.chapterService.updateImages(new_chapter.id, data));

  //     this.comicService.getById(new_chapter.id_comic).then(async (comic) => {
  //       const users_following = await this.userService.getListUserFollowingComic(comic.id);

  //       for (const user of users_following) {
  //         const notify: INotification = {
  //           id_user: user.id_user,
  //           title: 'Chương mới!',
  //           body: `${comic.name} vừa cập nhật thêm chapter mới - ${new_chapter.name}.`,
  //           redirect_url: `/comic/${comic.slug}/${new_chapter.slug}`,
  //           thumb: comic.thumb,
  //         };

  //         this.notifyService.create(notify);
  //         this.notifyService.notifyToUser(notify);
  //       }
  //     });

  //     return response.status(HttpStatus.OK).json({
  //       statusCode: HttpStatus.OK,
  //       success: true,
  //       message: 'Tạo chapter mới cho truyện thành công!',
  //       result: {},
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     return response.status(error.status | 500).json({
  //       statusCode: error.status | 500,
  //       success: false,
  //       message: 'INTERNAL SERVER ERROR',
  //     });
  //   }
  // }

  // @UseGuards(JwtAuthorizationd, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @UseInterceptors(FilesInterceptor('files'))
  // @Post('/chapter/update/:id_chapter')
  // async updateChapterForComic(
  //   @Body(new ValidationPipe()) chapter_information: UpdateChapterDTO,
  //   @Param('id_chapter', new ParseIntPipe()) id_chapter: number,
  //   @IdUser() id_user: number,
  //   @Res() response: Response,
  //   @UploadedFiles() files: Express.Multer.File[],
  // ) {
  //   try {
  //     const update_chapter: IChapter = {
  //       ...chapter_information,
  //       id_comic: parseInt(chapter_information.id_comic.toString()),
  //       id: id_chapter,
  //     };

  //     const chapter = await this.chapterService.update({ ...update_chapter });

  //     this.cloudinaryService
  //       .uploadMultipleFile(files, `comics/${chapter.id_comic}/${chapter.id}`)
  //       .then((data) =>
  //         this.chapterService.updateImagesAtSpecificPosition(
  //           chapter.id,
  //           chapter_information.change_image_at.split(',').map((ele: string) => parseInt(ele)),
  //           data,
  //         ),
  //       );

  //     this.comicService.getById(chapter.id_comic).then((comic) => {
  //       const notify: INotification = {
  //         id_user,
  //         title: 'Chương mới!',
  //         body: `${comic.name} vừa cập nhật lại chapter - ${chapter.name}.`,
  //         redirect_url: `${process.env.HOST_BE}/comic/${comic.slug}/${chapter.slug}`,
  //         thumb: comic.thumb,
  //       };

  //       this.notifyService.create(notify);

  //       this.userService.checkFollowing(id_user, chapter.id_comic).then((data) => {
  //         if (data) {
  //           this.notifyService.notifyToUser(notify);
  //         }
  //       });
  //     });

  //     return response.status(HttpStatus.OK).json({
  //       statusCode: HttpStatus.OK,
  //       success: true,
  //       message: `Cập nhật chapter ${chapter_information.name} truyện thành công!`,
  //       result: {},
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     return response.status(error.status | 500).json({
  //       statusCode: error.status | 500,
  //       success: false,
  //       message: 'INTERNAL SERVER ERROR',
  //     });
  //   }
  // }
}
