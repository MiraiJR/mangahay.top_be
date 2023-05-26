import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import { Response } from 'express';
import { ChapterService } from '../chapter/chapter.service';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { IComic } from './comic.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateChapterDTO } from '../chapter/DTO/create-chapter';
import { INotification } from '../notification/notification.interface';
import { IdUser } from '../user/decorators/id-user';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { Roles, RolesGuard } from 'src/common/guards/check-role';
import { UserRole } from '../user/user.role';
import { IChapter } from '../chapter/chapter.interface';
import { UpdateChapterDTO } from '../chapter/DTO/update-chapter';

@Controller('api/comic')
export class ComicController {
  constructor(
    private logger: Logger = new Logger(ComicController.name),
    private comicService: ComicService,
    private chapterService: ChapterService,
    private cloudinaryService: CloudinaryService,
    private notifyService: NotificationService,
    private userService: UserService,
  ) {}

  @Get()
  async getAllComic(@Query() query: any, @Res() response: Response) {
    try {
      const temp_comics = await this.comicService.getAll(query);

      const comics = [];

      for (const comic of temp_comics) {
        const chapter_newest = await this.chapterService.getNewestChapter(
          comic.id,
        );

        const temp_comic = {
          ...comic,
          new_chapter: chapter_newest,
        };

        comics.push(temp_comic);
      }
      const total = await this.comicService.getTotal();

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'get all comic successfully!',
        result: comics,
        total: total,
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/create')
  async createComic(
    @Body() comic: any,
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
  async updateComic(
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
      data_update_comic.authors = data_update_comic.authors
        .toString()
        .split(',');

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
  async getGenres(@Res() response: Response) {
    try {
      const genres = await this.comicService.getGenres();
      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tăng thành công!',
        result: genres,
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

  @Get('/ranking')
  async getRanking(@Query() query: any, @Res() response: Response) {
    try {
      const comics = await this.comicService.ranking(query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'get all comic successfully!',
        result: comics,
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

  @Get('/search')
  async search(@Query() query: any, @Res() response: Response) {
    try {
      const comics = await this.comicService.search(query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tìm kiếm thành công!',
        result: comics ? comics : [],
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

  @Get(':name')
  async getComic(@Param('name') name_comic: string, @Res() response: Response) {
    try {
      const comic = await this.comicService.getOne(name_comic);
      const chapters = await this.chapterService.getAll(comic.id);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'get all comic successfully!',
        result: {
          comic,
          chapters,
        },
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

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('delete/:id_comic')
  async deleteComic(
    @Param('id_comic', new ParseIntPipe()) id_comic: number,
    @Res() response: Response,
  ) {
    try {
      const is_exist = await this.comicService.getById(id_comic);

      if (is_exist) {
        await this.chapterService.deleteAllChapterOfComic(id_comic).then(() => {
          this.userService.deleteComicFromEvaluate(id_comic);
          this.userService.deleteComicFromFollow(id_comic);
          this.userService.deleteComicFromLike(id_comic);
        });

        this.comicService.delete(id_comic);
      } else {
        throw new NotFoundException('Truyện không tồn tại');
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: `Xóa truyện với id ${id_comic} thành công!`,
        result: {},
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

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('/chapter/create')
  async createChapterForComic(
    @Body(new ValidationPipe()) chapter: CreateChapterDTO,
    @IdUser() id_user: number,
    @Res() response: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const new_chapter = await this.chapterService.create({ ...chapter });

      this.cloudinaryService
        .uploadMultipleFile(
          files,
          `comics/${new_chapter.id_comic}/${new_chapter.id}`,
        )
        .then((data) => this.chapterService.updateImages(new_chapter.id, data));

      this.comicService.getById(new_chapter.id_comic).then((comic) => {
        const notify: INotification = {
          id_user,
          title: 'Chương mới!',
          body: `${comic.name} vừa cập nhật thêm chapter mới - ${new_chapter.name}.`,
          redirect_url: `http://localhost:3001/comic/${comic.slug}/${new_chapter.slug}`,
          thumb: comic.thumb,
        };

        this.notifyService.create(notify);

        this.userService
          .checkFollowing(id_user, new_chapter.id_comic)
          .then((data) => {
            if (data) {
              this.notifyService.notifyToUser(notify);
            }
          });
      });

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tạo chapter mới cho truyện thành công!',
        result: {},
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

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('/chapter/update/:id_chapter')
  async updateChapterForComic(
    @Body(new ValidationPipe()) chapter_information: UpdateChapterDTO,
    @Param('id_chapter', new ParseIntPipe()) id_chapter: number,
    @IdUser() id_user: number,
    @Res() response: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const update_chapter: IChapter = {
        ...chapter_information,
        id_comic: parseInt(chapter_information.id_comic.toString()),
        id: id_chapter,
      };

      const chapter = await this.chapterService.update({ ...update_chapter });

      this.cloudinaryService
        .uploadMultipleFile(files, `comics/${chapter.id_comic}/${chapter.id}`)
        .then((data) =>
          this.chapterService.updateImagesAtSpecificPosition(
            chapter.id,
            chapter_information.change_image_at
              .split(',')
              .map((ele: string) => parseInt(ele)),
            data,
          ),
        );

      this.comicService.getById(chapter.id_comic).then((comic) => {
        const notify: INotification = {
          id_user,
          title: 'Chương mới!',
          body: `${comic.name} vừa cập nhật lại chapter - ${chapter.name}.`,
          redirect_url: `http://localhost:3001/comic/${comic.slug}/${chapter.slug}`,
          thumb: comic.thumb,
        };

        this.notifyService.create(notify);

        this.userService
          .checkFollowing(id_user, chapter.id_comic)
          .then((data) => {
            if (data) {
              this.notifyService.notifyToUser(notify);
            }
          });
      });

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: `Cập nhật chapter ${chapter_information.name} truyện thành công!`,
        result: {},
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

  @Get(':name/increment')
  async increament(
    @Query() query: any,
    @Param('name') slug_comic: string,
    @Res() response: Response,
  ) {
    try {
      const updated_comic = await this.comicService.increment(
        slug_comic,
        query.field,
        parseInt(query.jump),
      );

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Tăng thành công!',
        result: updated_comic,
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

  // lấy thống kê theo ngày
  @Get('/analysis/new-comic')
  async analysisByDay(
    @Query('number_day', new ParseIntPipe()) number_day: number,
    @Res() response: Response,
  ) {
    try {
      const result = await this.comicService.analysisDayAgo(number_day);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: result,
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

  @Get('/analysis/grow-past-current')
  async analysisGrow(@Res() response: Response) {
    try {
      const result = await this.comicService.compareCurDateAndPreDate();

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: result,
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
