/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChapterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  id_comic: number;
}
