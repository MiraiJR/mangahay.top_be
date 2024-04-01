import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UPDATE_IMAGE_WITH_FILE_OR_NOT {
  NO = 0,
  YES = 1,
}

export class UpdateComicDTO {
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

  @IsNotEmpty()
  @IsEnum(UPDATE_IMAGE_WITH_FILE_OR_NOT)
  isUpdateImage: UPDATE_IMAGE_WITH_FILE_OR_NOT;
}
