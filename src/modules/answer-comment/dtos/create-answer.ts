import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAnswerDTO {
  @IsNotEmpty()
  @IsString()
  @Length(2)
  content: string;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  mentionedPerson: string;
}
