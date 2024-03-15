import { Injectable } from '@nestjs/common';
import { ReadingHistory } from './readingHistory.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comic } from '../comic/comic.entity';

@Injectable()
export class ReadingHistoryRepository extends Repository<ReadingHistory> {
  constructor(
    @InjectRepository(ReadingHistory)
    repository: Repository<ReadingHistory>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getReadingHistoryOfUser(userId: number): Promise<any> {
    const queryBuilder = this.createQueryBuilder('readingHistory')
      .where('readingHistory.userId = :userId', { userId })
      .leftJoinAndMapOne(
        'readingHistory.comic',
        Comic,
        'comic',
        'readingHistory.comicId = comic.id',
      )
      .select(['readingHistory'])
      .addSelect(['comic.id', 'comic.slug', 'comic.name', 'comic.thumb', 'comic.briefDescription'])
      .orderBy('readingHistory.readAt', 'DESC');

    const readingHistory = queryBuilder.getMany();
    return readingHistory;
  }
}
