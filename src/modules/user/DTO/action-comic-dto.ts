/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ActionComicDTO {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsNumber()
  @IsNotEmpty()
  id_comic: number;
}
