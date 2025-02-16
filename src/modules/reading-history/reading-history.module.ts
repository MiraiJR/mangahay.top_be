import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistory } from './reading-history.entity';
import { ReadingHistoryRepository } from './reading-history.repository';
import { ReadingHistoryService } from './reading-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingHistory])],
  controllers: [],
  providers: [ReadingHistoryService, ReadingHistoryRepository],
  exports: [ReadingHistoryService],
})
export class ReadingHistoryModule {}
