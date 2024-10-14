import { ApplicationException } from '@common/exception/application.exception';
import { JwtAdapterService } from '@common/external-service/jwt/jwt.adapter';
import CommonError from '@common/resources/error/error';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtAdapterService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token = this.extractToken(request);

    const payload = await this.jwtService.verifyAccessToken(token);
    const currentUser = await this.validateUser(payload.userId, token);

    request.user = { id: payload.userId, role: payload.role };

    return !!currentUser;
  }

  private getRequest(context: ExecutionContext): any {
    return context.switchToHttp().getRequest();
  }

  private extractToken(request: any): string {
    const authorizationHeader: string = request.header('Authorization');
    if (!authorizationHeader) {
      throw new ApplicationException(CommonError.COMMON_ERROR_0003);
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new ApplicationException(CommonError.COMMON_ERROR_0003);
    }
    return token;
  }

  private async validateUser(userId: number, token: string) {
    const currentUser = await this.userService.getUserById(userId);
    if (!currentUser || token !== currentUser.accessToken) {
      return null;
    }
    return currentUser;
  }
}
