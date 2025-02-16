import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateComicRequest {
  @IsOptional()
  @Type(() => Array)
  @IsArray()
  changedFields?: string[] = [];

  @IsOptional()
  @Type(() => Array)
  @IsArray()
  changedData?: string[] = [];
}
