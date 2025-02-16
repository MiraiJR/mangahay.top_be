import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';
import { User } from '@modules/user/user.entity';
import { UserRepository } from '@modules/user/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReindexUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly elasticsearchAdapter: ElasticsearchAdapterService,
  ) {}

  async execute() {
    const users = await this.userRepository.getAllUser();
    const convertedComics = this.convertData(users);
    for (const user of convertedComics) {
      await this.elasticsearchAdapter.updateRecord<ShortUserInfo>(IndexName.USERS, user.id, user);
    }
  }

  private convertData(users: User[]): ShortUserInfo[] {
    return users.map((user) => {
      return {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
      };
    });
  }
}
