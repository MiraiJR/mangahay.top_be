import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReadingHistoryService } from '../reading-history/readingHistory.service';
import { ReadingHistoryDTO } from '../reading-history/dtos/readingHistoryDto';
import { UpdateProfileDTO } from './dtos/updateProfile.dto';
import UserId from '@common/decorators/userId';
import { MAX_FILE_SIZE } from '@common/constant/Constant';

@Controller('api/users')
export class UserController {
  constructor(
    private userService: UserService,
    private readingHistoryService: ReadingHistoryService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  handleGetUserInformation(@UserId() userId: number) {
    return this.userService.getUserById(userId);
  }

  @UseGuards(AuthGuard)
  @Get('/me/reading-history')
  async handleGetHistory(@UserId() userId: number) {
    const comics = await this.readingHistoryService.getReadingHistoryOfUser(userId);

    return comics;
  }

  @UseGuards(AuthGuard)
  @Post('/me/reading-history')
  async handleAddToHistory(
    @Body(new ValidationPipe()) data: ReadingHistoryDTO,
    @UserId() userId: number,
  ) {
    const { chapterId, comicId } = data;
    await this.readingHistoryService.recordNewHistory(userId, comicId, chapterId);

    return `Thêm vào lịch sử thành công!`;
  }

  @UseGuards(AuthGuard)
  @Delete('/me/reading-history')
  async handleDeleteAllHistory(@UserId() userId: number) {
    await this.readingHistoryService.deleteAllReadingHistoryOfUser(userId);

    return `Xoá toàn bộ lịch sử thành công!`;
  }

  @UseGuards(AuthGuard)
  @Delete('/me/reading-history/:comicId')
  async handleDeleteOneRecordRedingHistory(
    @Param('comicId', new ParseIntPipe()) comicId: number,
    @UserId() userId: number,
  ) {
    await this.readingHistoryService.deleteOneReadingHistory(userId, comicId);

    return `Xoá truyện ra khỏi lịch sử thành công!`;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @Put('/me/profile/avatar')
  async handleUpdateAvatar(@UserId() userId: number, @UploadedFile() file: Express.Multer.File) {
    const user = await this.userService.updateAvatar(userId, file);

    return user;
  }

  @UseGuards(AuthGuard)
  @Patch('/me/profile')
  async handleUpdateProfile(
    @UserId() userId: number,
    @Body(new ValidationPipe()) changedProfile: UpdateProfileDTO,
  ) {
    const { fullname, phone } = changedProfile;
    const user = await this.userService.updateProfile(userId, fullname, phone);

    return user;
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get('/me/comics/following')
  async handleGetFollowingComics(@UserId() userId: number) {
    const comics = await this.userService.getFollowingComicOfUser(userId);

    return comics;
  }
}
