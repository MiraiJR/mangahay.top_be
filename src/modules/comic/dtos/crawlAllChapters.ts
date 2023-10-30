import { IsNotEmpty, IsString } from 'class-validator';

export class CrawlAllChaptersDTO {
  @IsNotEmpty()
  urls: string;

  @IsNotEmpty()
  @IsString()
  querySelector: string;

  @IsNotEmpty()
  @IsString()
  attribute: string;
}
