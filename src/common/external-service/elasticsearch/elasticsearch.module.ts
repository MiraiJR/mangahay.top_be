import { Module } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchAdapterService } from './elasticsearch.adapter';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_ENDPOINT'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
      }),
    }),
  ],
  providers: [ElasticsearchAdapterService],
  exports: [ElasticsearchAdapterService],
})
export class ElasticsearchAdapterModule {}
