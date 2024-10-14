type FilterSortOption = 'asc' | 'desc';

type ChapterCrawler = {
  chapterUrl: string;
  chapterName: string;
};

type QuerySearch = {
  comicName?: string;
  page?: number;
  limit?: number;
  filterState?: string;
  filterSort?: string;
  filterAuthor?: string;
  filterGenres?: string[];
};
