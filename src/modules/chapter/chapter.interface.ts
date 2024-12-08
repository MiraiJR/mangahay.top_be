import { ChapterType } from './types/ChapterType';

export interface IChapter {
  id?: number;
  name?: string;
  comicId?: number;
  slug?: string;
  creator?: number;
  creatorId?: number;
  order?: number;
  type?: ChapterType;
}
