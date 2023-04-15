import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthorizationd } from 'src/common/guards/jwt-guard';
import { IdUser } from './decorators/id-user';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationService } from '../notification/notification.service';

@Controller('api/user')
export class UserController {
  constructor(
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
    private notifyService: NotificationService,
  ) {}

  @UseGuards(JwtAuthorizationd)
  @Get('/credentials')
  async getCredentialUserInformation(
    @IdUser() id: any,
    @Res() response: Response,
  ) {
    try {
      const user = await this.userService.getUserById(id);

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
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      if (action === 'follow') {
        await this.userService.followComic(id_user, id_comic);
      } else if (action === 'like') {
        await this.userService.likeComic(id_user, id_comic);
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Theo dõi truyện thành công!',
        result: {},
      });
    } catch (error) {
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
    @Query('action') action: string,
    @Body('id_comic', new ParseIntPipe()) id_comic: number,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      if (action === 'follow') {
        await this.userService.unfollowComic(id_user, id_comic);
      } else if (action === 'like') {
        await this.userService.unlikeComic(id_user, id_comic);
      }

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Hủy theo dõi truyện thành công!',
        result: {},
      });
    } catch (error) {
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

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Lấy thông tin thành công!',
        result: result,
      });
    } catch (error) {
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
    // @Query() query: any,
    @IdUser() id_user: number,
    @Res() response: Response,
  ) {
    try {
      const notifies = await this.notifyService.getNotifiesOfUser(id_user);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: notifies,
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: 'Lỗi!',
      });
    }
  }
}
