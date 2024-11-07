import { Type } from 'class-transformer';
import { IsPositive } from 'class-validator';

export class SearchComicRequest {
  @Type(() => Number)
  @IsPositive()
  page: number = 1;

  @Type(() => Number)
  size: number = 10000;
  name: string = '';
  author: string = '';
  status: string;
  orderBy: 'asc' | 'desc' | 'updatedAt' | 'view' | 'follow' | 'like' = 'updatedAt';
  @Type(() => Array)
  genres: string[];
}
