import { IsNotEmpty, IsPositive } from 'class-validator';

export class ReadingHistoryDTO {
  @IsNotEmpty()
  @IsPositive()
  comicId: number;

  @IsNotEmpty()
  @IsPositive()
  chapterId: number;
}
