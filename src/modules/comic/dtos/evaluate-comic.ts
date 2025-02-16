import { Transform, Type } from 'class-transformer';
import { IsNumber, Min, Max } from 'class-validator';

export class EvaludateComicRequest {
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(5)
  score: number;
}
