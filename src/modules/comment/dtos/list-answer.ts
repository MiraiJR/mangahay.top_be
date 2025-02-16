import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, ValidateIf } from 'class-validator';

export class ListAnswerRequest {
  @IsPositive()
  @Transform(({ value }) => (value === 0 || value == null ? Number.MAX_SAFE_INTEGER : value))
  limit: number = Number.MAX_SAFE_INTEGER;

  @ValidateIf((inputData) => !!inputData.lastAnswerId)
  @IsNumber()
  lastAnswerId: number;
}
