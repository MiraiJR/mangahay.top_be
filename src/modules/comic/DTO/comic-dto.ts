/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ComicDTO {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  slug: string;

  @Field((type) => String)
  name: string;

  @Field((type) => String)
  another_name: string;

  @Field((type) => [String])
  genres: string[];

  @Field((type) => [String])
  authors: string[];

  @Field((type) => String)
  state: string;

  @Field((type) => String)
  thumb: string;

  @Field((type) => String)
  brief_desc: string;

  @Field((type) => Int)
  view: number;

  @Field((type) => Int)
  like: number;

  @Field((type) => Int)
  follow: number;

  @Field((type) => Int)
  star: number;

  @Field((type) => Int)
  id_owner: number;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  updatedAt: Date;
}
