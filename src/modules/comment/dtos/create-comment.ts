import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentDTO {
  @IsNotEmpty()
  @IsString()
  @Length(2)
  content: string;
}
