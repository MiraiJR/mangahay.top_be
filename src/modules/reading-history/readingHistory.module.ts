import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistory } from './readingHistory.entity';
import { ReadingHistoryRepository } from './readingHistory.repository';
import { ReadingHistoryService } from './readingHistory.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingHistory])],
  controllers: [],
  providers: [ReadingHistoryService, ReadingHistoryRepository],
  exports: [ReadingHistoryService],
})
export class ReadingHistoryModule {}
