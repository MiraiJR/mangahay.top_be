import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReadingHistoryRepository } from './readingHistory.repository';
import { ReadingHistoryResponse } from './types/ReadingHistoryResponse';

@Injectable()
export class ReadingHistoryService {
  constructor(private readingHistoryRepository: ReadingHistoryRepository) {}

  async getReadingHistoryOfUser(userId: number): Promise<ReadingHistoryResponse> {
    const readingHistorys = await this.readingHistoryRepository.getReadingHistoryOfUser(userId);
    const comics: ReadingHistoryResponse = readingHistorys.map(
      (readingHistory: any) => readingHistory.comic,
    );

    return comics;
  }

  async getOneRecordHistoryByComicId(userId: number, comicId: number) {
    return this.readingHistoryRepository.findOne({
      where: {
        userId,
        comicId,
      },
    });
  }

  async recordNewHistory(userId: number, comicId: number, chapterId: number) {
    const record = this.getOneRecordHistoryByComicId(userId, comicId);

    if (!record) {
      return this.readingHistoryRepository.save({
        userId,
        comicId,
        chapterId,
      });
    }

    return this.readingHistoryRepository.update(
      {
        userId,
        comicId,
      },
      {
        chapterId,
      },
    );
  }

  async deleteAllReadingHistoryOfUser(userId: number) {
    return this.readingHistoryRepository.delete({
      userId,
    });
  }

  async deleteOneReadingHistory(userId: number, comicId: number) {
    const readingHistory = await this.getOneRecordHistoryByComicId(userId, comicId);

    if (!readingHistory) {
      throw new HttpException(
        'Truyện không tồn tại trong lịch sử của bạn!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.readingHistoryRepository.delete({
      userId,
      comicId,
    });
  }
}
