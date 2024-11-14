import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CrawlChapterDTO {
  @IsNotEmpty()
  @IsString()
  urlPost: string;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  nameChapter: string;

  @Type(() => Number)
  @IsNotEmpty()
  comicId: number;

  querySelector: string;
  attribute: string;
}
