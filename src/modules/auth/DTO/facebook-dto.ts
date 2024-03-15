import { IsNotEmpty } from 'class-validator';

export class LoginFacebookDTO {
  email: string;

  phone: string;

  @IsNotEmpty()
  avatar: string;

  @IsNotEmpty()
  fullname: string;
}
