import { IsArray, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChapterRequest {
  @IsString()
  @IsNotEmpty()
  chapterName: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  imageIdsNeedDelete: number[] = [];
}
