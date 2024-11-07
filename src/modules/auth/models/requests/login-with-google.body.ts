import { IsNotEmpty } from 'class-validator';

export class LoginWithGoogleBody {
  @IsNotEmpty()
  authCode: string;
}
