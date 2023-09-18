import { IsNotEmpty, IsString } from 'class-validator';

export class ActionComicDTO {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsNotEmpty()
  id_comic: string;
}
