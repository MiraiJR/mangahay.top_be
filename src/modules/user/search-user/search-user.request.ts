import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchUserRequest {
  @IsNotEmpty()
  @IsString()
  queryName: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  excludedIds: number[];
}
