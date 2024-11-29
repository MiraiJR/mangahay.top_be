import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUserRequest {
  @IsNotEmpty()
  @IsString()
  queryName: string;
}
