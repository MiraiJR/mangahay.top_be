import { ApplicationException } from '@common/exception/application.exception';
import CommonError from '@common/resources/error/error';
import AuthError from '@modules/auth/resources/error/error';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class JwtAdapterService {
  constructor(private jwtService: JwtService, private configService: ConfigService) {}

  signAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(
      {
        ...payload,
      },
      {
        secret: this.configService.get('ACCESSTOKEN_KEY'),
        expiresIn: this.configService.get('ACCESSTOKEN_EXPIRED'),
      },
    );
  }

  signRefreshToken(payload: TokenPayload): string {
    return this.jwtService.sign(
      {
        ...payload,
      },
      {
        secret: this.configService.get('REFRESHTOKEN_KEY'),
        expiresIn: this.configService.get('REFRESHTOKEN_EXPIRED'),
      },
    );
  }

  signTokenForgetPassword(email: string): string {
    return this.jwtService.sign(
      {
        email: email,
      },
      {
        secret: this.configService.get('FORGETPASSWORD_KEY'),
        expiresIn: parseInt(this.configService.get('FORGETPASSWORD_EXPIRED')),
      },
    );
  }

  async verifyTokenForgetPassword(token: string): Promise<{ email: string }> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('FORGETPASSWORD_KEY'),
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ApplicationException(AuthError.AUTH_ERROR_0006);
      } else if (error instanceof JsonWebTokenError) {
        throw new ApplicationException(AuthError.AUTH_ERROR_0004);
      }

      throw new ApplicationException(CommonError.COMMON_ERROR_0001);
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('REFRESHTOKEN_KEY'),
      });

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ApplicationException(AuthError.AUTH_ERROR_0007);
      } else if (error instanceof JsonWebTokenError) {
        throw new ApplicationException(AuthError.AUTH_ERROR_0004);
      }

      throw new ApplicationException(CommonError.COMMON_ERROR_0001);
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('ACCESSTOKEN_KEY'),
      });

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ApplicationException(AuthError.AUTH_ERROR_0005);
      } else if (error instanceof JsonWebTokenError) {
        throw new ApplicationException(AuthError.AUTH_ERROR_0004);
      }

      throw new ApplicationException(CommonError.COMMON_ERROR_0001);
    }
  }
}
