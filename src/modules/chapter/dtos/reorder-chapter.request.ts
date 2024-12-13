import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, ValidateNested } from 'class-validator';

class ReorderChapter {
  @IsNumber()
  chapterId: number;

  @IsNumber()
  newOrder: number;
}

export class ReorderChapterBody {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderChapter)
  listReorderedChapter: ReorderChapter[];

  @IsNumber()
  comicId: number;
}
