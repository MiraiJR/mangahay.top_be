import { ComicModule } from '@modules/comic/comic.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MigrateDataToElasticsearch } from './elasticsearch/migrate-data.service';

@Module({
  imports: [ComicModule, UserModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [MigrateDataToElasticsearch],
  exports: [],
})
export class ScheduleJobModule {}
