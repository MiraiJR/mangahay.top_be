import { Body, Controller, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login.dto';
import { RegisterUserDTO } from './dto/register.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import UserId from '../../common/decorators/userId';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body(new ValidationPipe()) data: RegisterUserDTO) {
    await this.authService.register(data);
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
  @UseGuards(AuthGuard)
  async logout(@UserId() userId: number) {
    await this.authService.logout(userId);

    return 'Đăng xuất thành công!';
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
