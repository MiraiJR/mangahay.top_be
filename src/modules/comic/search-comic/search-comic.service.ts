import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { Injectable } from '@nestjs/common';
import { SearchComicRequest } from './dto/search-comic.request';
import { SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';
import { CanNotSearchException } from '@common/exception/common/can-not-search.exception';
import CommonError from '@common/resources/error/error';
import { ComicUtilService } from '../shared/comic.util';
import { SearchManagedComicRequest } from './dto/search-managed-comic.request';

@Injectable()
export class SearchComicService {
  constructor(
    private readonly elasticsearchService: ElasticsearchAdapterService,
    private readonly comicUtilService: ComicUtilService,
  ) {}

  async searchComic(inputData: SearchComicRequest) {
    const { page, size, orderBy } = inputData;
    try {
      const elasticsearch = this.elasticsearchService.getInstance();

      const { hits } = await elasticsearch.search({
        from: (page - 1) * size,
        size: size,
        sort: this.buildSort(orderBy) as SortCombinations[],
        query: {
          bool: {
            must: this.buildConditionQuery(inputData),
          },
        },
        index: IndexName.COMICS,
      });

      return {
        query: inputData,
        total: hits.total['value'],
        comics: hits.hits.map((record) => record._source),
        hasNext: hits.total['value'] > page * size,
      };
    } catch (error) {
      throw new CanNotSearchException({
        ...CommonError.COMMON_ERROR_0005,
        rootCause: error.message,
      });
    }
  }

  async searchManagedComic(userId: number, inputData: SearchManagedComicRequest) {
    try {
      const elasticsearch = this.elasticsearchService.getInstance();
      const managedComicIds = await this.comicUtilService.getListComicIdMangedByUserId(userId);

      const { hits } = await elasticsearch.search({
        query: {
          bool: {
            must: [
              {
                terms: {
                  id: managedComicIds,
                },
              },
              {
                bool: {
                  should: [
                    {
                      multi_match: {
                        query: inputData.name,
                        fields: ['name', 'anotherName', 'briefDescription'],
                        fuzziness: 'AUTO',
                      },
                    },
                    {
                      wildcard: {
                        name: {
                          value: `*${inputData.name}*`,
                          case_insensitive: true,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        index: IndexName.COMICS,
      });

      return {
        query: inputData,
        total: hits.total['value'],
        comics: hits.hits.map((record) => record._source),
        hasNext: false,
      };
    } catch (error) {
      throw new CanNotSearchException({
        ...CommonError.COMMON_ERROR_0005,
        rootCause: error.message,
      });
    }
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
      return [{ 'name.keyword': { order: orderBy } }];
    }

    const sortOrder = sortableFields[orderBy];
    if (sortOrder) {
      return [{ [orderBy]: { order: sortOrder } }];
    }

    return [];
  }

  private buildConditionQuery(inputData: SearchComicRequest) {
    const conditions: any = [];

    if (inputData.name !== '') {
      conditions.push({
        bool: {
          should: [
            {
              multi_match: {
                query: inputData.name,
                fields: ['name', 'anotherName', 'briefDescription'],
                fuzziness: 'AUTO',
              },
            },
            {
              wildcard: {
                name: {
                  value: `*${inputData.name}*`,
                  case_insensitive: true,
                },
              },
            },
          ],
        },
      });
    }

    if (inputData.status) {
      conditions.push({
        match: {
          'state.keyword': inputData.status,
        },
      });
    }

    if (inputData.genres) {
      inputData.genres.forEach((genre) => {
        conditions.push({
          term: {
            'genres.keyword': genre,
          },
        });
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
