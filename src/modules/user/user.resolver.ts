/* eslint-disable @typescript-eslint/no-empty-function */
import { Args, Context, Int, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDTO } from './DTO/user-dto';
import { Logger, UseGuards } from '@nestjs/common';
import { GraphqlJwtAuthGuard } from '../../common/guards/graphql-authorization';
import { UserFollowComicDTO } from './DTO/user-follow-dto';
import { NotifyDTO } from '../notification/DTO/notify-dto';
import { NotificationService } from '../notification/notification.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private logger: Logger = new Logger(UserResolver.name),
    private userService: UserService,
    private notifyService: NotificationService,
  ) {}

  @UseGuards(GraphqlJwtAuthGuard)
  @Query(() => UserDTO)
  async getCredentialUserInformation(
    @Context() context: { req: { idUser: number } },
  ) {
    try {
      return await this.userService.getUserById(context.req.idUser);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @UseGuards(GraphqlJwtAuthGuard)
  @Query(() => [UserFollowComicDTO])
  async getFollowingComic(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @Context() context: { req: { idUser: number } },
  ) {
    try {
      const result = await this.userService.getFollowingComic(
        context.req.idUser,
        {
          page,
          limit,
        },
      );

      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  @UseGuards(GraphqlJwtAuthGuard)
  @Query(() => [UserFollowComicDTO])
  async getLikedComic(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @Context() context: { req: { idUser: number } },
  ) {
    try {
      const result = await this.userService.getLikedComic(context.req.idUser, {
        page,
        limit,
      });

      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  @UseGuards(GraphqlJwtAuthGuard)
  @Query(() => [NotifyDTO])
  async getNotifiesOfUser(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @Context() context: { req: { idUser: number } },
  ) {
    try {
      return await this.notifyService.getNotifiesOfUser(context.req.idUser, {
        page,
        limit,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Query(() => [UserDTO])
  async getAllUser() {
    try {
      return await this.userService.getAll();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
