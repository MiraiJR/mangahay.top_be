import { ReindexComicService } from '@modules/comic/elasticsearch/services/reindex-comic.service';
import { ReindexUserService } from '@modules/user/elasticsearch/services/reindex-users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MigrateDataToElasticsearch {
  private logger: Logger = new Logger(MigrateDataToElasticsearch.name);

  constructor(
    private readonly reindexComicService: ReindexComicService,
    private readonly reindexUserService: ReindexUserService,
  ) {}

  @Cron('0 0 * * *')
  execute() {
    // TODO: write log
    this.logger.log('Tiến hành đồng bộ dữ liệu lên elasticsearch ...');
    this.reindexComicService.execute();
    this.reindexUserService.execute();
  }
}
