import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './DTO/login-dto';
import { Response } from 'express';
import { RegisterUserDTO } from './DTO/register-dto';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { UserRole } from '../user/user.role';
import { MailService } from '../mail/mail.service';
import UserId from '../user/decorators/userId';

@Controller('api/auth')
export class AuthController {
  constructor(
    private logger: Logger = new Logger(AuthController.name),
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  @Post('/register')
  async register(@Body(new ValidationPipe()) data: RegisterUserDTO) {
    const mailOtp: string = this.authService.signTokenVerifyMail(data);
    await this.mailService.sendMailVerifyEmail(data.email, 'Xác nhận email', mailOtp);

    return `Vui lòng kiểm tra email để xác nhận đăng ký!`;
  }

  @Post('/login')
  async handleLogin(@Body(new ValidationPipe()) data: LoginUserDTO) {
    const user = await this.authService.login(data);

    return {
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    };
  }

  @Post('/refresh-token')
  async resignToken(@Body('refresh-token') rftoken: string) {
    const token = await this.authService.resignToken(rftoken);

    return token;
  }

  @Get('/logout')
  @UseGuards(JwtAuthorizationd)
  async logout(@UserId() userId: number) {
    await this.authService.logout(userId);
    await this.authService.removeSocket(userId);

    return 'Đăng xuất thành công!';
  }

  @Get('/verify-email')
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    await this.authService.verifyEmailToRegister(token, UserRole.VIEWER);

    return response.redirect(process.env.URL_SIGNIN);
  }

  @Post('/forget-password')
  async handleForgetPassword(@Body('email') email: string) {
    await this.authService.forgetPassword(email);

    return 'Vui lòng vào mail để để xác nhận đổi mật khẩu!';
  }

  @Post('/change-password')
  async changePassword(@Body('password') newPassword: string, @Query('token') token: string) {
    await this.authService.changePassword(token, newPassword);

    return 'Đổi mật khẩu thành công!';
  }
}
