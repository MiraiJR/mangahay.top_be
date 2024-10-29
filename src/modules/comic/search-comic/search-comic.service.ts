import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { Injectable } from '@nestjs/common';
import { SearchComicRequest } from './dto/search-comic.request';
import { SortCombinations } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class SearchComicService {
  constructor(private readonly elasticsearchService: ElasticsearchAdapterService) {}

  async searchComic(inputData: SearchComicRequest) {
    const { page, limit, orderBy } = inputData;
    const elasticsearch = this.elasticsearchService.getInstance();

    const { hits } = await elasticsearch.search({
      from: (page - 1) * limit,
      size: limit,
      sort: this.buildSort(orderBy) as SortCombinations[],
      query: {
        bool: {
          must: this.buildConditionQuery(inputData),
        },
      },
    });

    return {
      query: {
        ...inputData,
      },
      total: hits.total['value'],
      comics: hits.hits.map((record) => record._source),
      hasNext: hits.total['value'] > page * limit,
    };
  }

  private buildSort(orderBy?: string) {
    if (!orderBy) return [];

    const sortableFields: Record<string, string> = {
      view: 'desc',
      like: 'desc',
      follow: 'desc',
      createdAt: 'desc',
    };

    if (['asc', 'desc'].includes(orderBy)) {
      return [{ name: { order: orderBy } }];
    }

    const sortOrder = sortableFields[orderBy];
    if (sortOrder) {
      return [{ [orderBy]: { order: sortOrder } }];
    }

    return [];
  }

  private buildConditionQuery(inputData: SearchComicRequest) {
    const conditions: any = [
      {
        multi_match: {
          query: inputData.name,
          fields: ['name', 'anotherName', 'briefDescription'],
          fuzziness: 'AUTO',
        },
      },
    ];

    if (inputData.status) {
      conditions.push({
        match: {
          'state.keyword': inputData.status,
        },
      });
    }

    if (inputData.genres) {
      conditions.push({
        terms: {
          'genres.keyword': inputData.genres,
        },
      });
    }

    if (inputData.author) {
      conditions.push({
        match: {
          authors: {
            query: inputData.author,
            fuzziness: 'AUTO',
          },
        },
      });
    }

    return conditions;
  }
}
