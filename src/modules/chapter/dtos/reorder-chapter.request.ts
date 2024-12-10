import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

class ReorderChapter {
  @IsNumber()
  chapterId: number;

  @IsNumber()
  newOrder: number;
}

export class ReorderChapterBody {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderChapter)
  listReorderedChapter: ReorderChapter[];

  @IsNumber()
  comicId: number;
}
