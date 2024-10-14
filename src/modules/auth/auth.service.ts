import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { RegisterUserDTO } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { LoginUserDTO } from './dto/login.dto';
import { UserRole } from '../user/user.role';
import { MailService } from '../../common/external-service/mail/mail.service';
import { UserRepository } from '../user/user.repository';
import { ApplicationException } from '@common/exception/application.exception';
import AuthError from './resources/error/error';
import { hashPassword, isMatchedPassword } from '@common/utils/password.util';
import UserError from '@modules/user/resources/error/error';
import { JwtAdapterService } from '@common/external-service/jwt/jwt.adapter';
import { LoginResponse } from './models/responses/login.reponse';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtAdapterService,
    private userService: UserService,
    private mailService: MailService,
    private userRepository: UserRepository,
  ) {}

  async register(inputData: RegisterUserDTO): Promise<User> {
    const isUsedEmail = await this.userService.isExistedEmail(inputData.email);

    if (isUsedEmail) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0001);
    }

    const newUser = await this.userService.create({
      ...inputData,
      password: await hashPassword(inputData.password),
      active: true,
      role: UserRole.VIEWER,
    });

    return newUser;
  }

  async logout(userId: number): Promise<void> {
    const matchedUser = await this.userService.getUserById(userId);

    if (!matchedUser) {
      throw new ApplicationException(UserError.USER_ERROR_0001);
    }

    await this.userRepository.updatePairToken(userId, {
      accessToken: null,
      refreshToken: null,
    });
  }

  async login(inputData: LoginUserDTO): Promise<LoginResponse> {
    let matchedUser = await this.userService.getUserByEmail(inputData.email);

    if (!matchedUser) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0002);
    }

    const checkPassword = await isMatchedPassword(inputData.password, matchedUser.password);

    if (!checkPassword) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0003);
    }

    const accessToken = this.jwtService.signAccessToken({
      userId: matchedUser.id,
      role: matchedUser.role,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      userId: matchedUser.id,
      role: matchedUser.role,
    });

    await this.userRepository.updatePairToken(matchedUser.id, {
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
    const userId = payload.userId;
    const matchedUser = await this.userService.getUserById(userId);

    if (matchedUser.refreshToken !== token) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0004);
    }

    const accessToken = this.jwtService.signAccessToken({
      userId: matchedUser.id,
      role: matchedUser.role,
    });
    const refreshToken = this.jwtService.signRefreshToken({
      userId: matchedUser.id,
      role: matchedUser.role,
    });

    await this.userRepository.updatePairToken(userId, {
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
    await this.userService.updatePassword(payload.email, newPassword);
  }
}
