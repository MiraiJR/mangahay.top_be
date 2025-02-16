import { PagingDTO } from '@common/dtos/pagination';
import { NotificationType, toNotificationType } from '@common/types/NotificationType';
import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export class GetNotificationsRequest extends PagingDTO {
  @IsIn([0, 1])
  @Transform(({ value }) => toNotificationType(value))
  type: NotificationType;
}
