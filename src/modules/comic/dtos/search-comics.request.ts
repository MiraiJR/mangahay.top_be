import { PagingDTO } from '@common/dtos/PagingDTO';

export class SearchComicsRequest extends PagingDTO {
  comicName: string = '';
}
