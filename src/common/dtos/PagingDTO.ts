import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class PagingDTO {
  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  page: number = 1;

  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  size: number = 20;
}
