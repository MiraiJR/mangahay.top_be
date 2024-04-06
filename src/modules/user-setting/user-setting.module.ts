import { Global, Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserSettingService } from './user-setting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingEntity } from './user-setting.entity';
import { UserSettingRepository } from './user-setting.repository';
import { UserSettingController } from './user-setting.controller';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserSettingEntity]), forwardRef(() => UserModule), JwtModule],
  controllers: [UserSettingController],
  providers: [UserSettingService, UserSettingRepository],
  exports: [UserSettingService, UserSettingRepository],
})
export class UserSettingModule {}
