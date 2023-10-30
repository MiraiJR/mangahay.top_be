import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserFollowComicDTO {
  @Field((type) => Int)
  comics_id: number;

  @Field((type) => String)
  comics_slug: string;

  @Field((type) => String)
  comics_name: string;

  @Field((type) => String)
  comics_another_name: string;

  @Field((type) => [String])
  comics_genres: string[];

  @Field((type) => [String])
  comics_authors: string[];

  @Field((type) => String)
  comics_state: string;

  @Field((type) => String)
  comics_thumb: string;

  @Field((type) => String)
  comics_brief_desc: string;

  @Field((type) => Int)
  comics_view: number;

  @Field((type) => Int)
  comics_like: number;

  @Field((type) => Int)
  comics_follow: number;

  @Field((type) => Int)
  comics_star: number;

  @Field((type) => Int)
  comics_id_owner: number;

  @Field((type) => Date)
  comics_createdAt: Date;

  @Field((type) => Date)
  comics_updatedAt: Date;
}
