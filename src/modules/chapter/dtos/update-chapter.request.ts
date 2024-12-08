import { IsArray, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChapterRequest {
  @IsString()
  @IsNotEmpty()
  chapterName: string;

  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  imageIdsNeedDelete: number[];
}
