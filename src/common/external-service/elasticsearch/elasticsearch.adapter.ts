import { Injectable } from '@nestjs/common';
import { ElasticsearchService as ElasticsearchServiceEa } from '@nestjs/elasticsearch';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ElasticsearchAdapterService {
  constructor(private readonly elasticsearchService: ElasticsearchServiceEa) {}

  async addRecord<T>(index: string, document: T) {
    const id = uuidv4();
    return this.elasticsearchService.index({
      index,
      id,
      body: document,
    });
  }

  getInstance() {
    return this.elasticsearchService;
  }
}
