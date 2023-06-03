/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class HistoryDTO {
  @IsNotEmpty()
  id_comic: number;

  id_chapter: number;

  id_user: number;
}
