import {
  Body,
  Controller,
  Get,
  Post,
  Put,
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
import UserId from '../user/decorators/userId';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body(new ValidationPipe()) data: RegisterUserDTO) {
    await this.authService.register(data, UserRole.VIEWER);

    return `Đăng ký tài khoản thành công!`;
  }

  @Post('/login')
  async handleLogin(@Body(new ValidationPipe()) data: LoginUserDTO) {
    return this.authService.login(data);
  }

  @Post('/refresh-token')
  async handleResignToken(@Body('refreshToken') refreshToken: string) {
    const token = await this.authService.resignToken(refreshToken);

    return token;
  }

  @Put('/logout')
  @UseGuards(JwtAuthorizationd)
  async logout(@UserId() userId: number) {
    await this.authService.logout(userId);

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
