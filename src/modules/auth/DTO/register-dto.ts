/* eslint-disable prettier/prettier */
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsString()
  @Length(8)
  password: string;
}
