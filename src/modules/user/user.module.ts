import { Logger, Module } from '@nestjs/common';
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

@Module({
  imports: [
    CloudinaryModule,
    JwtModule,
    NotificationModule,
    TypeOrmModule.forFeature([User, User_Follow_Comic, User_Like_Comic]),
  ],
  controllers: [UserController],
  providers: [UserService, UserResolver, Logger],
  exports: [UserService],
})
export class UserModule {}
