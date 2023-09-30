import { IsNotEmpty, IsPositive, IsString, Length } from 'class-validator';

export class CrawlChapterDTO {
  @IsNotEmpty()
  @IsString()
  urlPost: string;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  nameChapter: string;

  querySelector: string;
  attribute: string;
}
