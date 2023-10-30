import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class GetComicsDTO {
  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  page: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  limit: number;
}
