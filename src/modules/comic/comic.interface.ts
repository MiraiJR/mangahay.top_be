export interface IComic {
  id?: number;
  slug?: string;
  name?: string;
  another_name?: string;
  genres?: string[];
  authors?: string[];
  state?: string;
  thumb?: string;
  brief_desc?: string;
  view?: number;
  like?: number;
  follow?: number;
  star?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
