import { IsEnum, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { ChapterViewType } from '../enums/chapter-view-type';

export class ChapterSettingRequest {
  @IsEnum(ChapterViewType)
  type: ChapterViewType;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Số lượng tối thiểu là 1 và tối đa là 3' })
  @Max(3, { message: 'Số lượng tối thiểu là 1 và tối đa là 3' })
  amount: number;
}
