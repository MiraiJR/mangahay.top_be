import { IsNotEmpty, IsNumber, IsString, Length, ValidateIf } from 'class-validator';

export class CommandCommentRequest {
  @IsNumber()
  comicId: number;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  content: string;

  @ValidateIf((inputData) => !!inputData.targetCommentId)
  @IsNumber()
  targetCommentId: number;

  @ValidateIf((inputData) => !!inputData.mentionedUserId)
  @IsNumber()
  mentionedUserId: number;
}
