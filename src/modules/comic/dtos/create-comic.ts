import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateComicDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  anotherName: string;

  @IsNotEmpty()
  @IsArray()
  genres: string[];

  @IsNotEmpty()
  @IsArray()
  authors: string[];

  @IsNotEmpty()
  @IsString()
  briefDescription: string;

  @IsNotEmpty()
  @IsArray()
  translators: string[];
}
