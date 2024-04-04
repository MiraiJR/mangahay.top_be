import { UserService } from '../user/user.service';

export class UserSettingService {
  constructor(private readonly userService: UserService) {}
}
