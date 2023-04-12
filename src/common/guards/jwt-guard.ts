/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';

// guard này chủ yếu check user đã đăng nhập chưa -> nếu rồi thì lấy userid từ request
@Injectable()
export class JwtAuthorizationd implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // lấy jwt token từ header authorization
    const authHeader = request.header('Authorization');
    const jwtToken = authHeader && authHeader.split(' ')[1];
    try {
      // trong payload sẽ là một object có 2 fields là id + username
      const payload = await this.jwtService.verify(jwtToken, {
        secret: process.env.ACCESSTOKEN_KEY,
      });

      const curUser = await this.userService.getUserById(payload.idUser);

      if (curUser) {
        request.idUser = payload.idUser;
      }

      return curUser ? true : false;
    } catch (error) {
      console.log('expired');
      // trường hợp jwt token hết hạn
      return false;
    }
  }
}