import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
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
import { IdUser } from '../user/decorators/id-user';
import { UserService } from '../user/user.service';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { UserRole } from '../user/user.role';
import { MailService } from '../mail/mail.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private logger: Logger = new Logger(AuthController.name),
    private authService: AuthService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  @Post('/register')
  async register(@Body(new ValidationPipe()) data: RegisterUserDTO, @Res() response: Response) {
    try {
      const mailOtp: string = this.authService.signTokenVerifyMail(data);
      await this.mailService.sendMailVerifyEmail(data.email, 'Xác nhận email', mailOtp);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Vui lòng vào mail để xác nhận tài khoản!',
        result: {},
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/login')
  async handleLogin(@Body(new ValidationPipe()) data: LoginUserDTO, @Res() response: Response) {
    try {
      const user = await this.authService.login(data);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Đăng nhập thành công!',
        result: {
          access_token: user.accessToken,
          refresh_token: user.refreshToken,
        },
      });
    } catch (error) {
      console.log(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/refresh-token')
  async resignToken(@Body('refresh-token') rftoken: string, @Res() response: Response) {
    try {
      const token = await this.authService.resignToken(rftoken);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Cấp lại token thành công!',
        result: token,
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Get('/logout')
  @UseGuards(JwtAuthorizationd)
  async logout(@IdUser() userId: number, @Res() response: Response) {
    try {
      await this.authService.logout(userId);
      await this.authService.removeSocket(userId);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Đăng xuất thành công!',
        result: {},
      });
    } catch (error) {
      return response.status(error.status).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Get('/verify-email')
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    try {
      await this.authService.verifyEmailToRegister(token, UserRole.VIEWER);

      return response.redirect(process.env.URL_SIGNIN);
    } catch (error) {
      return response.status(error.status).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/forget-password')
  async handleForgetPassword(@Body('email') email: string, @Res() response: Response) {
    try {
      await this.authService.forgetPassword(email);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Vui lòng vào mail để để xác nhận đổi mật khẩu!',
        result: {},
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/change-password')
  async changePassword(
    @Body('password') newPassword: string,
    @Query('token') token: string,
    @Res() response: Response,
  ) {
    try {
      await this.authService.changePassword(token, newPassword);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Đổi mật khẩu thành công!',
        result: {},
      });
    } catch (error) {
      console.log(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/admin/register')
  async adminRegister(
    @Body(new ValidationPipe()) data: RegisterUserDTO,
    @Res() response: Response,
  ) {
    try {
      const check_user = await this.userService.getUserByEmail(data.email);

      if (check_user) {
        throw new ConflictException(`Email ${data.email} đã được sử dụng`);
      }

      const mail_otp: string = await this.authService.signTokenVerifyMail(data);
      await this.mailService.sendMailRegisterAdmin(data.email, 'Xác nhận email', mail_otp);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Vui lòng vào mail để xác nhận tài khoản!',
        result: {},
      });
    } catch (error) {
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @Get('/admin/verify-email')
  async adminVerifyEmail(@Query('token') data: string, @Res() response: Response) {
    try {
      await this.authService.verifyEmailToRegister(data, UserRole.ADMIN);

      return response.redirect('http://localhost:3002/auth/login');
    } catch (error) {
      return response.status(error.status).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }
}
