import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChapterViewType } from '../enums/chapter-view-type';

class ChapterDetails {
  @IsEnum(ChapterViewType)
  @IsNotEmpty()
  type: ChapterViewType;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Số lượng tối thiểu là 1 và tối đa là 3' })
  @Max(3, { message: 'Số lượng tối thiểu là 1 và tối đa là 3' })
  amount: number;
}

class NotificationSettings {
  @IsBoolean()
  mention: boolean;
}

export class ChapterSettingRequest {
  @ValidateNested()
  @Type(() => ChapterDetails)
  @IsNotEmpty()
  chapter: ChapterDetails;

  @ValidateNested()
  @Type(() => NotificationSettings)
  @IsNotEmpty()
  notification: NotificationSettings;
}
