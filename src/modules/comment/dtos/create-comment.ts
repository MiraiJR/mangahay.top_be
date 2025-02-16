import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  ValidateIf,
  IsArray,
  IsNumber as IsNumberEach,
} from 'class-validator';

export class CreateCommentRequest {
  @IsNumber()
  comicId: number;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  content: string;

  @ValidateIf((inputData) => !!inputData.targetCommentId)
  @IsNumber()
  targetCommentId: number;

  @ValidateIf((inputData) => !!inputData.mentionedUserIds)
  @IsArray()
  @IsNumberEach({}, { each: true })
  mentionedUserIds: number[] = [];
}
