import { IsNotEmpty, IsString } from 'class-validator';

export class CrawlChaptersReq {
  @IsNotEmpty()
  @IsString()
  urlComic: string;
  @IsNotEmpty()
  @IsString()
  querySelectorChapterUrl: string;
  @IsNotEmpty()
  @IsString()
  attributeChapterUrl: string;
  @IsNotEmpty()
  @IsString()
  querySelectorChapterName: string;
  @IsNotEmpty()
  @IsString()
  querySelectorImageUrl: string;
  @IsNotEmpty()
  @IsString()
  attributeImageUrl: string;
}
