import { IsNotEmpty, IsPositive, IsString, Length } from 'class-validator';

export class CreateChapterDTO {
  @IsString()
  @IsNotEmpty()
  @Length(2)
  nameChapter: string;
}
