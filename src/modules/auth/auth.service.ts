import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDTO } from './DTO/register-dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './DTO/login-dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../user/user.role';
import { SALT_HASH_PWD } from 'src/common/utils/salt';
import { RedisService } from '../redis/redis.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  async register(newUser: RegisterUserDTO, role: string): Promise<User> {
    const checkUser = await this.userService.getUserByEmail(newUser.email);

    if (checkUser) {
      throw new ConflictException(`Email ${newUser.email} đã được sử dụng`);
    }

    const salt = await SALT_HASH_PWD;
    const hash_password = await bcrypt.hash(newUser.password, salt);

    const user = await this.userService.create({
      ...newUser,
      password: hash_password,
      active: true,
      role: role === 'admin' ? UserRole.ADMIN : UserRole.VIEWER,
    });

    return user;
  }

  async logout(userId: number): Promise<void> {
    let user = await this.userService.getUserById(userId);

    if (!user) {
      throw new HttpException('Người dùng không tồn tại!', HttpStatus.BAD_REQUEST);
    }

    user = {
      ...user,
      accessToken: null,
      refreshToken: null,
    };

    await this.userService.update(userId, user);
  }

  async verifyEmailToRegister(token: string, accountRole: string): Promise<void> {
    const newAccountInformation: RegisterUserDTO = await this.jwtService.verify(token, {
      secret: process.env.VERIFY_EMAIL_KEY,
    });

    await this.register(newAccountInformation, accountRole);
  }

  async login(userLogin: LoginUserDTO): Promise<User> {
    let user = await this.userService.getUserByEmail(userLogin.email);

    if (!user) {
      throw new HttpException('Thông tin đăng nhập không chính xác', HttpStatus.BAD_REQUEST);
    }

    if (!user.active) {
      throw new HttpException('Tài khoản chưa xác thực địa chỉ email!', HttpStatus.BAD_REQUEST);
    }

    const checkPassword = await bcrypt.compare(userLogin.password, user.password);

    if (!checkPassword) {
      throw new HttpException('Mật khẩu không chính xác!', HttpStatus.BAD_REQUEST);
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    user = {
      ...user,
      accessToken,
      refreshToken,
    };
    await this.userService.update(user.id, user);

    return user;
  }

  signAccessToken(payload: any): string {
    return this.jwtService.sign(
      {
        idUser: payload.id,
      },
      {
        secret: this.configService.get('ACCESSTOKEN_KEY'),
        expiresIn: this.configService.get('ACCESSTOKEN_EXPIRED'),
      },
    );
  }

  signRefreshToken(payload: any): string {
    return this.jwtService.sign(
      {
        idUser: payload.id,
      },
      {
        secret: this.configService.get('REFRESHTOKEN_KEY'),
        expiresIn: this.configService.get('REFRESHTOKEN_EXPIRED'),
      },
    );
  }

  signTokenVerifyMail(data: RegisterUserDTO): string {
    return this.jwtService.sign(data, {
      secret: this.configService.get('VERIFY_EMAIL_KEY'),
      expiresIn: parseInt(this.configService.get('VERIFY_EMAIL_EXPIRED')),
    });
  }

  signTokenForgetPassword(email: string) {
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

  async forgetPassword(email: string): Promise<void> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new ConflictException(`Email ${email} không khớp với bất kỳ tài khoản nào!`);
    }

    const forgetPasswordToken = this.signTokenForgetPassword(email);
    await this.mailService.sendMailForgetPassword(email, 'Quên mật khẩu', forgetPasswordToken);
  }

  async removeSocket(id: number) {
    await this.redisService.deleteObjectByKey(`USER:${id}:SOCKET`);
  }

  async resignToken(token: string): Promise<PairToken> {
    const payload = await this.jwtService.verify(token, {
      secret: process.env.REFRESHTOKEN_KEY,
    });

    if (!payload) {
      throw new HttpException('Token không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const userId = payload.idUser;
    let user = await this.userService.getUserById(userId);

    if (user.refreshToken !== token) {
      throw new HttpException('Token không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    // tạo token mới
    const accessToken = this.signAccessToken({
      id: userId,
    });
    const refreshToken = this.signRefreshToken({
      id: userId,
    });

    user = {
      ...user,
      accessToken,
      refreshToken,
    };

    await this.userService.update(userId, user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    const payload = await this.jwtService.verify(token, {
      secret: process.env.FORGETPASSWORD_KEY,
    });

    await this.userService.updatePassword(payload.email, newPassword);
  }
}
