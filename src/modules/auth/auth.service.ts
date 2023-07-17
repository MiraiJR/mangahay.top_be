import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDTO } from './DTO/register-dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './DTO/login-dto';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { UserRole } from '../user/user.role';
import { SALT_HASH_PWD } from 'src/common/utils/salt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER)
    private redisCache: Cache,
  ) {}

  async register(new_user: RegisterUserDTO, role: string) {
    try {
      // hash password
      const salt = await SALT_HASH_PWD;
      console.log(salt);
      const hash_password = await bcrypt.hash(new_user.password, salt);

      const user = await this.userService.create({
        ...new_user,
        password: hash_password,
        active: true,
        role: role === 'admin' ? UserRole.ADMIN : UserRole.VIEWER,
      });

      return user;
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async login(user_login: LoginUserDTO) {
    try {
      const check_user = await this.userService.getUserByEmail(
        user_login.email,
      );

      if (check_user) {
        if (check_user.active) {
          const check_password = await bcrypt.compare(
            user_login.password,
            check_user.password,
          );

          if (check_password) {
            return check_user;
          }
        }
      }

      throw new BadRequestException('Thông tin đăng nhập không chính xác!');
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        throw error;
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async signAccessToken(payload: any) {
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

  async signRefreshToken(payload: any) {
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

  async signTokenVerifyMail(data: RegisterUserDTO) {
    return this.jwtService.sign(data, {
      secret: this.configService.get('VERIFY_EMAIL_KEY'),
      expiresIn: parseInt(this.configService.get('VERIFY_EMAIL_EXPIRED')),
    });
  }

  async signTokenForgetPassword(email: string) {
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

  async blockToken(id: any, type: string) {
    try {
      const token = await this.redisCache.get(`USER:${id}:${type}`);

      await this.redisCache.set(`BLOCKLIST:${token}`, token, {
        ttl: this.configService.get<number>(`${type}_TIME_BL`),
      } as any);

      await this.redisCache.del(`USER:${id}:${type}`);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeSocket(id: number) {
    await this.redisCache.del(`USER:${id}:SOCKET`);
  }

  async resignToken(token: string) {
    // check token in block list token
    const checking = await this.redisCache.get(`BLOCKLIST:${token}`);

    if (checking) {
      throw new BadRequestException('Không hợp lệ!');
    }

    // lấy thông tin rftoken
    const payload = await this.jwtService.verify(token, {
      secret: process.env.REFRESHTOKEN_KEY,
    });

    if (payload) {
      const id_user = payload.idUser;

      // block token cuar phiển đăng nhập hiện tại
      await this.blockToken(id_user, 'ACCESSTOKEN');
      await this.blockToken(id_user, 'REFRESHTOKEN');

      // tạo token mới
      const at = await this.signAccessToken({
        id: id_user,
      });
      const rt = await this.signRefreshToken({
        id: id_user,
      });

      // thêm rf token vào redis phục vụ cho việc lấy lại at khi at hết hạn
      await this.redisCache.set(`USER:${id_user}:REFRESHTOKEN`, rt, {
        ttl: 1000 * 60 * 60 * 24 * 7,
      } as any);
      await this.redisCache.set(`USER:${id_user}:ACCESSTOKEN`, at, {
        ttl: 1000 * 60 * 60 * 2,
      } as any);

      return {
        access_token: at,
        refresh_token: rt,
      };
    } else {
      throw new BadRequestException('Không hợp lệ!');
    }
  }
}
