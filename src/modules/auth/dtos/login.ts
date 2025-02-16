import { IsEmail, IsString } from 'class-validator';

export class LoginAccountDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
