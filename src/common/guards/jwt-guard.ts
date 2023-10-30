import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtAuthorizationd implements CanActivate {
  constructor(private jwtService: JwtService, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.header('Authorization');
    const jwtToken = authHeader && authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verify(jwtToken, {
        secret: process.env.ACCESSTOKEN_KEY,
      });
      const curUser = await this.userService.getUserById(payload.idUser);

      if (jwtToken !== curUser.accessToken) {
        return false;
      }

      if (curUser) {
        request.idUser = payload.idUser;
        request.roleUser = curUser.role;
      }

      return curUser ? true : false;
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
