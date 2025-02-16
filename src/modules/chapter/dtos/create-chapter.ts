import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateChapterRequest {
  @IsString()
  @IsNotEmpty()
  @Length(2)
  name: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  comicId: number;

  @Type(() => Number)
  @IsIn([0, 1])
  isEnd: number;
}
