import { Logger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { User_Follow_Comic } from './user_follow/user_follow.entity';
import { User_Like_Comic } from './user_like/user-like.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';
import { UserResolver } from './user.resolver';
import { User_Evaluate_Comic } from './user_evaluate/user_evaluate.entity';
import { ComicModule } from '../comic/comic.module';
import { ComicService } from '../comic/comic.service';
import { Comic } from '../comic/comic.entity';
import { Genres } from '../comic/genre/genre.entity';
import { UserHistory } from './user_history/user_history.entity';

@Module({
  imports: [
    CloudinaryModule,
    JwtModule,
    NotificationModule,
    forwardRef(() => ComicModule),
    TypeOrmModule.forFeature([
      User,
      User_Follow_Comic,
      User_Like_Comic,
      User_Evaluate_Comic,
      Comic,
      Genres,
      UserHistory,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserResolver, Logger, ComicService],
  exports: [UserService],
})
export class UserModule {}
