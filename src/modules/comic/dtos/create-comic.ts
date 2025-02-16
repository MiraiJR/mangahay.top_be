import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { StatusComic } from '../enums/status-comic';

export class CreateComicRequest {
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

  @ValidateIf((inputData) => {
    return !!inputData.translators;
  })
  @IsArray()
  translators: string[];

  @IsNotEmpty()
  @IsEnum(StatusComic)
  state: StatusComic;
}
