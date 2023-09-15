import { Comic } from 'src/modules/comic/comic.entity';

type ReadingHistoryResponse = {
  id: number;
  slug: string;
  name: string;
  thumb: string;
  briefDescription: string;
  chapter?: {
    id: number;
    name: string;
    slug: string;
  };
};
