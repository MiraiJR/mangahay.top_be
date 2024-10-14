import { PagingDTO } from '@common/dtos/PagingDTO';

export class SearchComicRequest extends PagingDTO {
  name: string = '';
  author: string = '';
  status: string;
  orderBy: 'asc' | 'desc' | 'createdAt' | 'view' | 'follow' | 'like' = 'createdAt';
  genres: string[];
}
