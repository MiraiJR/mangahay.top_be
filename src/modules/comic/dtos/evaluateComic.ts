import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ScoreDTO {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  score: number;
}
