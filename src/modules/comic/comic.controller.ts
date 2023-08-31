import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { Response } from 'express';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { IComic } from './comic.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { IdUser } from '../user/decorators/id-user';
import { Roles, RolesGuard } from '../../common/guards/check-role';
import { UserRole } from '../user/user.role';

@Controller('api/comic')
export class ComicController {
  constructor(
    private logger: Logger = new Logger(ComicController.name),
    private comicService: ComicService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handleGetComics(@Query() query: any) {
    const comics = await this.comicService.getAll(query);
    const total = await this.comicService.getTotal();

    return {
      comics,
      total,
    };
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/create')
  async handleCreateComic(
    @Body() comic: IComic,
    @IdUser() id_user: number,
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const data_new_comic: IComic = {
        ...comic,
      };

      data_new_comic.genres = data_new_comic.genres.toString().split(',');
      data_new_comic.authors = data_new_comic.authors.toString().split(',');

      const new_comic = await this.comicService.create(data_new_comic);

      this.cloudinaryService
        .uploadFileFromBuffer(file.buffer, `comics/${new_comic.id}/thumb`)
        .then((data: any) => {
          this.comicService.updateThumb(new_comic.id, data.url);
        });

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tạo truyện mới thành công!',
        result: new_comic,
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Put('/update/:id_comic')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpdateComic(
    @Body() comic: any,
    @IdUser() id_user: number,
    @Param('id_comic', new ParseIntPipe()) id_comic: number,
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const data_update_comic: IComic = {
        ...comic,
        id: id_comic,
      };

      data_update_comic.genres = data_update_comic.genres.toString().split(',');
      data_update_comic.authors = data_update_comic.authors.toString().split(',');

      const update_comic = await this.comicService.update(data_update_comic);

      if (comic.file !== 'undefined') {
        this.cloudinaryService
          .uploadFileFromBuffer(file.buffer, `comics/${update_comic.id}/thumb`)
          .then((data: any) => {
            this.comicService.updateThumb(id_comic, data.url);
          });
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: `Cập nhật truyện ${comic.name} thành công!`,
        result: update_comic,
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @Get('/genres')
  async handleGetGenres() {
    const genres = await this.comicService.getGenres();

    return genres;
  }

  @Get('/ranking')
  async handleGetRanking(@Query() query: { field: string; limit: string }) {
    const comics = await this.comicService.ranking(query);

    return comics;
  }

  @Get('/search')
  async handleSearch(@Query() query: QuerySearch) {
    const comics = await this.comicService.search(query);

    return comics;
  }

  @Get(':slug')
  async handleGetComic(@Param('slug') slugComic: string) {
    const comic = await this.comicService.getComicBySlug(slugComic);

    return comic;
  }

  @Get('chapter/:comicId')
  async handleGetChaptersOfComic(@Param('comicId', new ParseIntPipe()) comicId: number) {
    const chapters = await this.comicService.getChapters(comicId);

    return chapters;
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('delete/:comicId')
  async handleDeleteComic(@Param('comicId', new ParseIntPipe()) comicId: number) {
    await this.comicService.delete(comicId);

    return `Xóa truyện với id ${comicId} thành công!`;
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

  @Get(':slugComic/increment')
  async handleIncreament(
    @Query() query: { field: string; jump: number },
    @Param('slugComic') slugComic: string,
  ) {
    await this.comicService.increment(slugComic, query.field, query.jump);

    return `Tăng [${query.field}] cho truyện thành công!`;
  }

  // // lấy thống kê theo ngày
  // @Get('/analysis/new-comic')
  // async analysisByDay(
  //   @Query('number_day', new ParseIntPipe()) number_day: number,
  //   @Res() response: Response,
  // ) {
  //   try {
  //     const result = await this.comicService.analysisDayAgo(number_day);

  //     return response.status(HttpStatus.OK).json({
  //       statusCode: HttpStatus.OK,
  //       success: true,
  //       message: 'Thao tác thành công!',
  //       result: result,
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     return response.status(error.status | 500).json({
  //       statusCode: error.status,
  //       success: false,
  //       message: 'Lỗi!',
  //     });
  //   }
  // }

  // @Get('/analysis/grow-past-current')
  // async analysisGrow(@Res() response: Response) {
  //   try {
  //     const result = await this.comicService.compareCurDateAndPreDate();

  //     return response.status(HttpStatus.OK).json({
  //       statusCode: HttpStatus.OK,
  //       success: true,
  //       message: 'Thao tác thành công!',
  //       result: result,
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     return response.status(error.status | 500).json({
  //       statusCode: error.status,
  //       success: false,
  //       message: 'Lỗi!',
  //     });
  //   }
  // }
}
