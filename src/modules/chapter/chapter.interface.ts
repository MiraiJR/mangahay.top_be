import { ChapterType } from './types/ChapterType';

export interface IChapter {
  id?: number;
  name?: string;
  images?: string[];
  comicId?: number;
  slug?: string;
  creator?: number;
  order?: number;
  type?: ChapterType;
}
