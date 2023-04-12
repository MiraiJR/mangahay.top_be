/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDTO {
  @IsNotEmpty()
  id_comment: number;

  @IsString()
  content: string;

  @IsNotEmpty()
  answer_user: string;
}
