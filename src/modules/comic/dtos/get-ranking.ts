import { PagingDTO } from '@common/dtos/pagination';
import { IsNotEmpty } from 'class-validator';

export class GetRankingRequest extends PagingDTO {
  @IsNotEmpty()
  field: string;
}
