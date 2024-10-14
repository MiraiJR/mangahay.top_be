export class FilterComicsRequest {
  filterState: string;
  filterSort: FilterSortOption = 'asc';
  filterAuthor: string = '';
  filterGenres: string[] = [];
}
