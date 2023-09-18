import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotifyDTO {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  title: string;

  @Field((type) => String)
  body: string;

  @Field((type) => Boolean)
  is_read: boolean;

  @Field((type) => String)
  redirect_url: string;

  @Field((type) => String)
  thumb: string;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  updatedAt: Date;
}
