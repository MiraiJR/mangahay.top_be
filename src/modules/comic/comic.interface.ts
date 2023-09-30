export interface IComic {
  id?: number;
  slug?: string;
  name?: string;
  anotherName?: string;
  genres?: string[];
  authors?: string[];
  state?: string;
  thumb?: string;
  briefDescription?: string;
  creator?: number;
  view?: number;
  like?: number;
  follow?: number;
  star?: number;
  translators?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
