import {
  Body,
  CACHE_MANAGER,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Inject,
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
import { Cache } from 'cache-manager';
import { IdUser } from '../user/decorators/id-user';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { MailService } from '../../common/utils/mail-service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private logger: Logger = new Logger(AuthController.name),
    private authService: AuthService,
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject(CACHE_MANAGER)
    private redisCache: Cache,
  ) {}

  @Post('/register')
  async register(
    @Body(new ValidationPipe()) data: RegisterUserDTO,
    @Res() response: Response,
  ) {
    try {
      const check_user = await this.userService.getUserByEmail(data.email);

      // email đã tồn tại
      if (check_user) {
        throw new ConflictException(`Email ${data.email} đã được sử dụng`);
      }

      const mail_otp: string = await this.authService.signTokenVerifyMail(data);
      await this.mailService.sendMail(data.email, 'Xác nhận email', mail_otp);

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
  async login(
    @Body(new ValidationPipe()) data: LoginUserDTO,
    @Res() response: Response,
  ) {
    try {
      const user = await this.authService.login(data);

      const at = await this.authService.signAccessToken(user);
      const rt = await this.authService.signRefreshToken(user);

      // thêm rf token vào redis phục vụ cho việc lấy lại at khi at hết hạn
      await this.redisCache.set(`USER:${user.id}:REFRESHTOKEN`, rt, {
        ttl: 1000 * 60 * 60 * 24 * 7,
      } as any);
      await this.redisCache.set(`USER:${user.id}:ACCESSTOKEN`, at, {
        ttl: 1000 * 60 * 60 * 2,
      } as any);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Đăng nhập thành công!',
        result: {
          access_token: at,
          refresh_token: rt,
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
  async resignToken(
    @Body('refresh-token') rftoken: string,
    @Res() response: Response,
  ) {
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
  async logout(@IdUser() id: any, @Res() response: Response) {
    try {
      await this.authService.blockToken(id, 'ACCESSTOKEN');
      await this.authService.blockToken(id, 'REFRESHTOKEN');
      await this.authService.removeSocket(id);

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
  async verifyEmail(@Query() data: any, @Res() response: Response) {
    try {
      const payload: RegisterUserDTO = await this.jwtService.verify(
        data.token,
        {
          secret: process.env.VERIFY_EMAIL_KEY,
        },
      );
      await this.authService.register(payload, 'viewer');
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
  async forgetPassword(
    @Body('email') email: string,
    @Res() response: Response,
  ) {
    try {
      const check_user = await this.userService.getUserByEmail(email);

      // email đã tồn tại
      if (!check_user) {
        throw new ConflictException(
          `Email ${email} không khớp với bất kỳ tài khoản nào!`,
        );
      }

      const forgetpw_token: string =
        await this.authService.signTokenForgetPassword(email);
      await this.mailService.sendMailForgetPassword(
        email,
        'Quên mật khẩu',
        forgetpw_token,
      );

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
    @Body('password') new_pwd: string,
    @Query() data: any,
    @Res() response: Response,
  ) {
    try {
      const payload = await this.jwtService.verify(data.token, {
        secret: process.env.FORGETPASSWORD_KEY,
      });

      await this.userService.updatePassword(payload.email, new_pwd);
      return response.redirect(process.env.URL_SIGNIN);
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

      // email đã tồn tại
      if (check_user) {
        throw new ConflictException(`Email ${data.email} đã được sử dụng`);
      }

      const mail_otp: string = await this.authService.signTokenVerifyMail(data);
      await this.mailService.sendMailRegisterAdmin(
        data.email,
        'Xác nhận email',
        mail_otp,
      );

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
  async adminVerifyEmail(@Query() data: any, @Res() response: Response) {
    try {
      const payload: RegisterUserDTO = await this.jwtService.verify(
        data.token,
        {
          secret: process.env.VERIFY_EMAIL_KEY,
        },
      );
      await this.authService.register(payload, 'admin');
      return response.redirect('http://localhost:3002/auth/login');
    } catch (error) {
      return response.status(error.status).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  // @Post('/login/facebook')
  // async loginByFacebook(
  //   @Res() response: Response,
  //   @Body(new ValidationPipe()) data: LoginFacebookDTO,
  // ) {
  //   try {
  //     let user = null;

  //     if (data.phone) {
  //       user = await this.userService.getUserByPhone(data.phone);
  //     }

  //     if (data.email) {
  //       user = await this.userService.getUserByEmail(data.email);
  //     }

  //     if (user) {
  //       // người dùng chưa từng đăng nhập = facebook nhưng đã có tài khoản
  //       if (!user.facebook) {
  //         if (!user.phone) {
  //           this.userService.update(user.id, {
  //             facebook: true,
  //             phone: data.phone,
  //           });
  //         } else {
  //           this.userService.update(user.id, {
  //             facebook: true,
  //           });
  //         }
  //       }
  //     } else {
  //       // người dùng chưa từng đăng nhập = fb + chưa có tài khoản

  //       // hash password
  //       const salt = await bcrypt.genSalt(10);
  //       const hash_password = await bcrypt.hash('12345678', salt);

  //       const new_user: IUser = {
  //         fullname: data.fullname,
  //         avatar: data.avatar,
  //         password: hash_password,
  //         facebook: true,
  //       };

  //       if (data.phone) {
  //         new_user.phone = data.phone;
  //       }

  //       if (data.email) {
  //         new_user.email = data.email;
  //       }

  //       user = await this.userService.create(new_user);
  //     }

  //     // người dùng đã từng đăng nhập bằng facebook rồi
  //     const at = await this.authService.signAccessToken(user);
  //     const rt = await this.authService.signRefreshToken(user);

  //     // thêm rf token vào redis phục vụ cho việc lấy lại at khi at hết hạn
  //     await this.redisCache.set(`USER:${user.id}:REFRESHTOKEN`, rt, {
  //       ttl: 1000 * 60 * 60 * 24 * 7,
  //     } as any);
  //     await this.redisCache.set(`USER:${user.id}:ACCESSTOKEN`, at, {
  //       ttl: 1000 * 60 * 60 * 2,
  //     } as any);

  //     return response.status(HttpStatus.OK).json({
  //       statusCode: HttpStatus.OK,
  //       success: true,
  //       message: 'Đăng nhập thành công!',
  //       result: {
  //         access_token: at,
  //         refresh_token: rt,
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error(error);
  //     return response.status(error.status | 500).json({
  //       statusCode: error.status,
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // @Post('/login/third-party')
  // async loginThirdParty(@Res() response: Response, @Body() data: any) {
  //   try {
  //     const data_provider = await this.authService
  //       .getInformationUserFromProvider('facebook', {
  //         data,
  //       })
  //       .then((response) => response.data);
  //   } catch (error) {
  //     this.logger.error(error);
  //     return response.status(error.status | 500).json({
  //       statusCode: error.status,
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }
}
