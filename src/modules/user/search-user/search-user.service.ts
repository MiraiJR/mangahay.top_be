import { ElasticsearchAdapterService } from '@common/external-service/elasticsearch/elasticsearch.adapter';
import { Injectable } from '@nestjs/common';
import { SearchUserRequest } from './search-user.request';
import { CanNotSearchException } from '@common/exception/common/can-not-search.exception';
import CommonError from '@common/resources/error/error';
import { IndexName } from '@common/external-service/elasticsearch/index-name.enum';

@Injectable()
export class SearchUserService {
  constructor(private readonly elasticsearchService: ElasticsearchAdapterService) {}

  async searchUser(inputData: SearchUserRequest) {
    const { queryName } = inputData;

    try {
      const elasticsearchInstance = this.elasticsearchService.getInstance();

      const { hits } = await elasticsearchInstance.search({
        sort: [
          {
            'fullname.keyword': {
              order: 'desc',
            },
          },
        ],
        query: {
          bool: {
            should: [
              {
                match: {
                  fullname: {
                    query: queryName,
                    fuzziness: 'AUTO',
                  },
                },
              },
              {
                wildcard: {
                  fullname: {
                    value: `*${queryName.toLowerCase()}*`,
                    case_insensitive: true,
                  },
                },
              },
            ],
          },
        },
        index: IndexName.USERS,
      });

      return {
        query: inputData,
        total: hits.total['value'],
        users: hits.hits.map((record) => {
          return {
            id: record._source['id'],
            fullname: record._source['fullname'],
          };
        }),
      };
    } catch (error) {
      throw new CanNotSearchException({
        ...CommonError.COMMON_ERROR_0005,
        rootCause: error.message,
      });
    }
  }
}
