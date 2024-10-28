import { Transform } from 'class-transformer';
import { IsPositive } from 'class-validator';

export class CommentQuery {
  @IsPositive()
  @Transform(({ value }) => (value === 0 || value === null ? 1 : value))
  page: number;

  @IsPositive()
  @Transform(({ value }) => (value === 0 || value === null ? Number.MAX_SAFE_INTEGER : value))
  size: number;
}
