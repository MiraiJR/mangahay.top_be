type ComicPreview = {
  id: number;
  slug: string;
  name: string;
  anotherName: string;
  genres: Array<string>;
  authors: Array<string>;
  state: string;
  thumb: string;
  brief_desc: string;
  view: number;
  like: number;
  follow: number;
  star: number;
  id_owner: string;
  createdAt: Date;
  updatedAt: Date;
  newestChapter: {
    id: number;
    name: string;
    slug: string;
  };
};
