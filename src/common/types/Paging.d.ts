import { Comic } from 'src/modules/comic/comic.entity';

type Paging = {
  page: number;
  limit: number;
};

type PagingComics = {
  total: number;
  comics: Comic[];
};
