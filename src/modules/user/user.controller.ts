import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';
import { Roles, RolesGuard } from '../../common/guards/check-role';
import { IdUser } from './decorators/id-user';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationService } from '../notification/notification.service';
import { User } from './user.entity';
import { ComicService } from '../comic/comic.service';
import { UserRole } from './user.role';
import { HistoryDTO } from './user_history/history.dto';
import { ActionComicDTO } from './DTO/action-comic-dto';

@Controller('api/user')
export class UserController {
  constructor(
    private logger: Logger = new Logger(UserController.name),
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
    private notifyService: NotificationService,
    private comicService: ComicService,
  ) {}

  @UseGuards(JwtAuthorizationd)
  @Get('/credentials')
  async getCredentialUserInformation(
    @IdUser() id: any,
    @Res() response: Response,
  ) {
    try {
      const user: User = await this.userService.getUserById(id);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Lấy thông tin thành công!',
        result: {
          ...user,
          password: null,
        },
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Post('/comic')
  async actionComic(
    @Query('action') action: string,
    @Body('id_comic', new ParseIntPipe()) id_comic: number,
    @Body('rating_star') rating_star: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      let message_response = '';
      if (action === 'follow') {
        await this.userService.followComic(id_user, id_comic);
        message_response = 'Theo dõi truyện thành công!';
      } else if (action === 'like') {
        await this.userService.likeComic(id_user, id_comic);
        message_response = 'Cảm ơn bạn đã thích truyện! <3';
      } else if (action === 'evaluate') {
        await this.userService.evaluateComic(id_user, id_comic);
        const update_comic = await this.comicService.updateRatingStar(
          id_comic,
          parseInt(rating_star),
        );

        message_response = 'Cảm ơn bạn đã đánh giá truyện <3!';

        return response.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          success: true,
          message: message_response,
          result: update_comic,
        });
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: message_response,
        result: {},
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Delete('/comic')
  async removeActionComic(
    @Query(new ValidationPipe()) query: ActionComicDTO,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      if (query.action === 'follow') {
        await this.userService.unfollowComic(id_user, query.id_comic);
      } else if (query.action === 'like') {
        await this.userService.unlikeComic(id_user, query.id_comic);
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Hủy theo dõi truyện thành công!',
        result: {},
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/history')
  async getHistory(@IdUser() id_user: number, @Res() response: Response) {
    try {
      const history = await this.userService.getHistory(id_user);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Lấy lịch sử thành công!',
        result: history,
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

  @UseGuards(JwtAuthorizationd)
  @Post('/history')
  async addToHistory(
    @Body(new ValidationPipe()) history: HistoryDTO,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      history = {
        id_user: id_user,
        id_comic: parseInt(history.id_comic.toString()),
        id_chapter: parseInt(history.id_chapter.toString()),
      };

      await this.userService.addToHistory(history);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thêm vào lịch sử thành công!',
        result: {},
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

  @UseGuards(JwtAuthorizationd)
  @Delete('/history')
  async deleteHistory(
    @Query('delete_all', new ParseBoolPipe()) delete_all: boolean,
    @Body('id_comic') id_comic: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      if (id_comic) {
        id_comic = parseInt(id_comic);
      }

      await this.userService.deleteHistory(delete_all, id_user, id_comic);

      const history = await this.userService.getHistory(id_user);
      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: delete_all
          ? `Xóa toàn bộ lịch sử thành công!`
          : `Xóa truyện khỏi lịch sử thành công thành công!`,
        result: history,
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

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('/management/:id_user')
  async banOrUnbanUser(
    @Param('id_user', new ParseIntPipe()) id_user: number,
    @Query() query: any,
    @Res() response: Response,
  ) {
    try {
      let message_response = '';

      if (query.ban) {
        if (query.ban === 'true') {
          this.userService.updateActive(id_user, false);
          message_response = `Ban user với id ${id_user} thành công!`;
        } else {
          this.userService.updateActive(id_user, true);
          message_response = `Unban user với id ${id_user} thành công!`;
        }
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: message_response,
        result: {},
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/comic/check')
  async checkFollowAndLikeComic(
    @Query('id_comic') id_comic: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      const result = {
        isFollow: false,
        isLike: false,
        isEvaluate: false,
      };

      const is_follow = await this.userService.isFollowComic(
        id_user,
        parseInt(id_comic),
      );
      result.isFollow = is_follow ? true : false;
      const is_like = await this.userService.isLikeComic(
        id_user,
        parseInt(id_comic),
      );
      result.isLike = is_like ? true : false;
      const is_evaluate = await this.userService.isEvaluateComic(
        id_user,
        parseInt(id_comic),
      );
      result.isEvaluate = is_evaluate ? true : false;

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Lấy thông tin thành công!',
        result: result,
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/update')
  async updateInformation(
    @Query() query: any,
    @IdUser() id_user: number,
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const response_file: any =
        await this.cloudinaryService.uploadFileFromBuffer(
          file.buffer,
          'users/avatars',
        );

      if (query.avatar == 1) {
        query.avatar = response_file.url;
      }

      this.userService.update(id_user, query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Cập nhật avatar thành công!',
        result: response_file.url,
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: 'Cập nhật avatar thấy bại!',
      });
    }
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/notifies')
  async getNotifies(
    @Query() query: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      const notifies = await this.notifyService.getNotifiesOfUser(
        id_user,
        query,
      );

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: notifies,
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

  @UseGuards(JwtAuthorizationd)
  @Get('/comic/following')
  async getFollowingComic(
    @Query() query: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      const following_comic = await this.userService.getFollowingComic(
        id_user,
        query,
      );

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: following_comic,
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

  @UseGuards(JwtAuthorizationd)
  @Get('/comic/liked')
  async getLikedComic(
    @Query() query: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      const liked_comic = await this.userService.getLikedComic(id_user, query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: liked_comic,
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
  // lấy thống kê theo ngày
  @Get('/analysis/new-user')
  async analysisByDay(
    @Query('number_day', new ParseIntPipe()) number_day: number,
    @Res() response: Response,
  ) {
    try {
      const result = await this.userService.analysisDayAgo(number_day);

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

  @Get('analysis/grow-past-current')
  async analysisGrow(@Res() response: Response) {
    try {
      const result = await this.userService.compareCurDateAndPreDate();

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
