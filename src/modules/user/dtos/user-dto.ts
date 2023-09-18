import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../user.role';

@ObjectType()
export class UserDTO {
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  email: string;

  @Field((type) => String)
  fullname: string;

  @Field((type) => String)
  avatar: string;

  @Field((type) => String)
  wallpaper: string;

  @Field((type) => Boolean)
  active: boolean;

  @Field()
  role: UserRole;

  @Field((type) => Date)
  createdAt: Date;

  @Field((type) => Date)
  updatedAt: Date;
}
