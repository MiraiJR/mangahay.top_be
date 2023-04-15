/* eslint-disable prettier/prettier */
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateComicDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  another_name: string;

  @IsArray()
  @IsNotEmpty()
  genres: string[];

  @IsArray()
  @IsNotEmpty()
  authors: string[];

  @IsString()
  @IsNotEmpty()
  brief_desc: string;
}
