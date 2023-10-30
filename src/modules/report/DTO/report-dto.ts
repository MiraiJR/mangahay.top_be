import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReportDTO {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  fullname: string;

  @Field((type) => String)
  email: string;

  @Field((type) => String)
  type: string;

  @Field((type) => String)
  detail_report: string;

  @Field((type) => [String])
  errors: string[];

  @Field((type) => Int)
  id_object: number;

  @Field((type) => String)
  link: string;

  @Field((type) => Boolean)
  is_resolve: boolean;
}
