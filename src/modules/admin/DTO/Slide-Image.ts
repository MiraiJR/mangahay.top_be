import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SlideImageDTO {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  link_image: string;
}
