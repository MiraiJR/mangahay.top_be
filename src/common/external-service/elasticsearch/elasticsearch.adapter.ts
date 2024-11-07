import { Injectable } from '@nestjs/common';
import { ElasticsearchService as ElasticsearchServiceEa } from '@nestjs/elasticsearch';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ElasticsearchAdapterService {
  constructor(private readonly elasticsearchService: ElasticsearchServiceEa) {}

  addRecord<T>(index: string, document: T, id?: any) {
    return this.elasticsearchService.index({
      index,
      id: id ?? uuidv4(),
      document,
    });
  }

  deleteRecord(index: string, id: any) {
    return this.elasticsearchService.deleteByQuery({
      index,
      query: {
        match: {
          id,
        },
      },
    });
  }

  updateRecord<T>(index: string, id: any, document: T) {
    return this.elasticsearchService.update({
      index,
      id,
      doc: document,
    });
  }

  getInstance() {
    return this.elasticsearchService;
  }
}
