import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterAccountDTO } from '../dtos/register';
import { AccountEntity } from '../account/account.entity';
import { hashPassword } from '@common/utils/password.util';
import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { User } from '@modules/user/user.entity';
import { UserSession } from '@modules/user/user-sessions/user-session.entity';
import { UserSettingEntity } from '@modules/user-setting/user-setting.entity';
import { ChapterViewType } from '@modules/user-setting/enums/chapter-view-type';
import { UserSocialEntity } from '@modules/user/user-social/user-social.entity';
import { ProviderType } from '@modules/user/user-social/social.enum';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';

@Injectable()
export class CreateAccoutUserFacade {
  constructor(
    private readonly datasource: DataSource,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
  ) {}

  async createAccount(inputData: RegisterAccountDTO) {
    return this.datasource.transaction(async (manager) => {
      const { email, fullname, password } = inputData;
      const newUser = await manager.getRepository(User).save({
        email,
        fullname,
      });

      await Promise.all([
        this.elasticsearchAdapter.addRecord<ShortUserInfo>(
          IndexName.USERS,
          {
            id: newUser.id,
            fullname: newUser.fullname,
            email: newUser.email,
            avatar: newUser.avatar,
          },
          newUser.id,
        ),
        manager.getRepository(UserSession).save({
          userId: newUser.id,
        }),
        manager.getRepository(UserSettingEntity).save({
          userId: newUser.id,
          chapterSetting: {
            type: ChapterViewType.DEFAULT,
            amount: 1,
          },
        }),
        manager.getRepository(AccountEntity).save({
          id: newUser.id,
          password: await hashPassword(password),
          email: inputData.email,
        }),
      ]);

      return newUser;
    });
  }

  async createAccountSocial(
    email: string,
    fullname: string,
    avatar: string,
    providerType: ProviderType,
    providerId: string,
  ) {
    return this.datasource.transaction(async (manager) => {
      const newUser = await manager.getRepository(User).save({
        email,
        fullname,
        avatar,
      });

      await Promise.all([
        manager.getRepository(UserSocialEntity).save({
          userId: newUser.id,
          providerType,
          providerId,
        }),
        manager.getRepository(UserSession).save({
          userId: newUser.id,
        }),
        manager.getRepository(UserSettingEntity).save({
          userId: newUser.id,
          chapterSetting: {
            type: ChapterViewType.DEFAULT,
            amount: 1,
          },
        }),
        this.elasticsearchAdapter.addRecord<ShortUserInfo>(
          IndexName.USERS,
          {
            id: newUser.id,
            fullname: newUser.fullname,
            email: newUser.email,
            avatar: newUser.avatar,
          },
          newUser.id,
        ),
      ]);

      return newUser;
    });
  }
}
