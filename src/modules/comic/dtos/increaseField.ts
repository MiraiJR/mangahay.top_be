import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class IncreaseFieldDTO {
  @Type(() => String)
  @IsNotEmpty()
  @IsString()
  field: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsPositive()
  jump: number;
}
