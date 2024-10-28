import { ApplicationException } from '@common/exception/application.exception';
import { JwtAdapterService } from '@common/external-service/jwt/jwt.adapter';
import AuthError from '@modules/auth/resources/error/error';
import { UserSessionRepository } from '@modules/user/user-sessions/user-session.repository';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtAdapterService,
    private readonly userSessionRepository: UserSessionRepository,
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
      throw new ApplicationException(AuthError.AUTH_ERROR_0004);
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0004);
    }
    return token;
  }

  private async validateUser(userId: number, token: string) {
    const sessionOfUser = await this.userSessionRepository.findSessionByUserId(userId);
    if (!sessionOfUser || token !== sessionOfUser.accessToken) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0004);
    }

    return sessionOfUser;
  }
}
