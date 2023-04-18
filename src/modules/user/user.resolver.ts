import { Context, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDTO } from './DTO/user-dto';
import { Logger, UseGuards } from '@nestjs/common';
import { GraphqlJwtAuthGuard } from '../../common/guards/graphql-authorization';
import { UserFollowComicDTO } from './DTO/user-follow-dto';

@Resolver('User')
export class UserResolver {
  constructor(
    private logger: Logger = new Logger(UserResolver.name),
    private userService: UserService,
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
  async getFollowingComic(@Context() context: { req: { idUser: number } }) {
    try {
      const result = await this.userService.getFollowingComic(
        context.req.idUser,
      );

      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  @UseGuards(GraphqlJwtAuthGuard)
  @Query(() => [UserFollowComicDTO])
  async getLikedComic(@Context() context: { req: { idUser: number } }) {
    try {
      const result = await this.userService.getLikedComic(context.req.idUser);

      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
