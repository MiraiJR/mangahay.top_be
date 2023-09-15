import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateComicDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  anotherName: string;

  @IsArray()
  @IsNotEmpty()
  genres: string[];

  @IsArray()
  @IsNotEmpty()
  authors: string[];

  @IsString()
  @IsNotEmpty()
  briefDescription: string;
}
