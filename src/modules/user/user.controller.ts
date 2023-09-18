import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
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
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationService } from '../notification/notification.service';
import UserId from './decorators/userId';
import { ReadingHistoryService } from '../reading-history/readingHistory.service';
import { ReadingHistoryDTO } from '../reading-history/dtos/readingHistoryDto';
import { PagingDTO } from 'src/common/dtos/PagingDTO';

@Controller('api/users')
export class UserController {
  constructor(
    private logger: Logger = new Logger(UserController.name),
    private userService: UserService,
    private cloudinaryService: CloudinaryService,
    private notifyService: NotificationService,
    private readingHistoryService: ReadingHistoryService,
  ) {}

  @UseGuards(JwtAuthorizationd)
  @Get('/me')
  async handleGetUserInformation(@UserId() userId: number) {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new HttpException('Người dùng không tồn tại!', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/me/reading-history')
  async handleGetHistory(@UserId() userId: number) {
    const comics = await this.readingHistoryService.getReadingHistoryOfUser(userId);

    return comics;
  }

  @UseGuards(JwtAuthorizationd)
  @Post('/me/reading-history')
  async handleAddToHistory(
    @Body(new ValidationPipe()) data: ReadingHistoryDTO,
    @UserId() userId: number,
  ) {
    const { chapterId, comicId } = data;
    await this.readingHistoryService.recordNewHistory(userId, comicId, chapterId);

    return `Thêm vào lịch sử thành công!`;
  }

  @UseGuards(JwtAuthorizationd)
  @Delete('/me/reading-history')
  async handleDeleteAllHistory(@UserId() userId: number) {
    await this.readingHistoryService.deleteAllReadingHistoryOfUser(userId);

    return `Xoá toàn bộ lịch sử thành công!`;
  }

  @UseGuards(JwtAuthorizationd)
  @Delete('/me/reading-history/:comicId')
  async handleDeleteOneRecordRedingHistory(
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @UserId() userId: number,
  ) {
    await this.readingHistoryService.deleteOneReadingHistory(userId, comicId);

    return `Xoá truyện ra khỏi lịch sử thành công!`;
  }

  @UseGuards(JwtAuthorizationd)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/me/profile/update')
  async updateInformation(
    @Query() query: any,
    @UserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const responseFile: any = await this.cloudinaryService.uploadFileFromBuffer(
      file.buffer,
      'users/avatars',
    );

    if (query.avatar == 1) {
      query.avatar = responseFile.url;
    }

    this.userService.update(userId, query);

    return responseFile.url;
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/me/notifies')
  async getNotifies(@Query(new ValidationPipe()) query: PagingDTO, @UserId() userId: number) {
    const notifies = await this.notifyService.getNotifiesOfUser(userId, query);

    return notifies;
  }

  @UseGuards(JwtAuthorizationd)
  @Put('/me/interact/:comicId')
  async handleIntractWithComic(
    @Query('action') interactionType: string,
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ) {
    const interaction = await this.userService.interactWithComic(userId, comicId, interactionType);
    const status: StatusInteractWithComicResponse = {
      isLiked: interaction.isLiked,
      isFollowed: interaction.isFollowed,
      isEvaluated: interaction.score === null ? false : true,
    };

    return status;
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/me/check-interaction/:comicId')
  async checkFollowAndLikeComic(
    @UserId() userId: number,
    @Param('comicId', new ParseIntPipe()) comicId: number,
  ): Promise<StatusInteractWithComicResponse> {
    const interaction = await this.userService.checkInteractionWithComic(userId, comicId);
    const status: StatusInteractWithComicResponse = {
      isLiked: interaction.isLiked,
      isFollowed: interaction.isFollowed,
      isEvaluated: interaction.score === null ? false : true,
    };

    return status;
  }

  @UseGuards(JwtAuthorizationd)
  @Get('/me/comics/following')
  async handleGetFollowingComics(
    @Query(new ValidationPipe()) query: PagingDTO,
    @UserId() userId: number,
  ) {
    const comics = await this.userService.getFollowingComicOfUser(userId, query);

    return comics;
  }
}
