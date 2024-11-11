import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { RegisterUserDTO } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { LoginUserDTO } from './dto/login.dto';
import { UserRole } from '../user/user.role';
import { MailService } from '../../common/external-service/mail/mail.service';
import { ApplicationException } from '@common/exception/application.exception';
import AuthError from './resources/error/error';
import { isMatchedPassword } from '@common/utils/password.util';
import UserError from '@modules/user/resources/error/error';
import { JwtAdapterService } from '@common/external-service/jwt/jwt.adapter';
import { LoginResponse } from './models/responses/login.reponse';
import { UserSessionRepository } from '@modules/user/user-sessions/user-session.repository';
import { LoginWithGoogleBody } from './models/requests/login-with-google.body';
import { OAuth2Service } from '@common/external-service/oauth2/oauth2.service';
import { UserSocialRepository } from '@modules/user/user-social/user-social.repository';
import { AccountRepository } from './account/account.repository';
import { ProviderType } from '@modules/user/user-social/social.enum';
import { CreateAccoutUserFacade } from './facade/create-account-user.facade';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtAdapterService,
    private userService: UserService,
    private mailService: MailService,
    private userSessionRepository: UserSessionRepository,
    private oauth2Service: OAuth2Service,
    private userSocialRepository: UserSocialRepository,
    private accountRepository: AccountRepository,
    private readonly createAccountFacade: CreateAccoutUserFacade,
  ) {}

  async register(inputData: RegisterUserDTO): Promise<User> {
    const isUsedEmail = await this.accountRepository.findByEmail(inputData.email);

    if (isUsedEmail) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0001);
    }

    return this.createAccountFacade.createAccount(inputData);
  }

  async logout(userId: number): Promise<void> {
    const matchedUser = await this.userService.getUserById(userId);

    if (!matchedUser) {
      throw new ApplicationException(UserError.USER_ERROR_0001);
    }

    await this.userSessionRepository.updatePairToken(matchedUser.id, {
      accessToken: null,
      refreshToken: null,
    });
  }

  async login(inputData: LoginUserDTO): Promise<LoginResponse> {
    let matchedAccount = await this.accountRepository.findByEmail(inputData.email);

    if (!matchedAccount) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0002);
    }

    const checkPassword = await isMatchedPassword(inputData.password, matchedAccount.password);

    if (!checkPassword) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0003);
    }

    const matchedUser = await this.userService.getUserById(matchedAccount.id);

    return this.updateTokenForUser(matchedUser.id, matchedUser.role);
  }

  private async updateTokenForUser(userId: number, userRole: UserRole) {
    const accessToken = this.jwtService.signAccessToken({
      userId: userId,
      role: userRole,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      userId: userId,
      role: userRole,
    });

    await this.userSessionRepository.updatePairToken(userId, {
      accessToken,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgetPassword(email: string): Promise<void> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new ConflictException(`Email ${email} không khớp với bất kỳ tài khoản nào!`);
    }

    const forgetPasswordToken = this.jwtService.signTokenForgetPassword(email);
    await this.mailService.sendMail<{
      name: string;
      url: string;
    }>(email, 'Quên mật khẩu', 'ForgetPassword', {
      name: user.fullname,
      url: `${process.env.URL_CHANGEPASSWORD}?token=${forgetPasswordToken}`,
    });
  }

  async resignToken(token: string): Promise<PairToken> {
    const payload = await this.jwtService.verifyRefreshToken(token);
    const { userId, role } = payload;
    const sessions = await this.userSessionRepository.findSessionByUserId(userId);

    if (sessions.refreshToken !== token) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0004);
    }

    const accessToken = this.jwtService.signAccessToken({
      userId: sessions.id,
      role: role,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      userId: sessions.id,
      role: role,
    });

    await this.userSessionRepository.updatePairToken(sessions.id, {
      accessToken,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    const payload = await this.jwtService.verifyTokenForgetPassword(token);
    await this.accountRepository.updatePassword(payload.email, newPassword);
  }

  async loginWithGoogle(inputData: LoginWithGoogleBody) {
    const { authCode } = inputData;

    const {
      email,
      name: fullname,
      picture,
      sub: googleId,
    } = await this.oauth2Service.getGoogleUserProfile(authCode);

    const matchedSocialAccount = await this.userSocialRepository.findBySocialIdAndType(
      googleId,
      ProviderType.GOOGLE,
    );

    if (matchedSocialAccount) {
      const matchedUser = await this.userService.getUserById(matchedSocialAccount.userId);
      return this.updateTokenForUser(matchedUser.id, matchedUser.role);
    }

    const newUser = await this.createAccountFacade.createAccountSocial(
      email,
      fullname,
      picture,
      ProviderType.GOOGLE,
      googleId,
    );

    return this.updateTokenForUser(newUser.id, newUser.role);
  }
}
