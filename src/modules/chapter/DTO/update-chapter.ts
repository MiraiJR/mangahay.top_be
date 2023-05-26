/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChapterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  id_comic: number;

  @IsNotEmpty()
  change_image_at: string;
}
