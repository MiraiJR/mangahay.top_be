import { Global, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserSettingService } from './user-setting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettingEntity } from './user-setting.entity';
import { UserSettingRepository } from './user-setting.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserSettingEntity])],
  controllers: [],
  providers: [UserSettingService, UserSettingRepository],
  exports: [UserSettingService, UserSettingRepository],
})
export class UserSettingModule {}
