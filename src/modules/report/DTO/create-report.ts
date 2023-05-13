/* eslint-disable prettier/prettier */
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDTO {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  detail_report: string;

  @IsArray()
  @IsNotEmpty()
  errors: string[];

  @IsNotEmpty()
  id_object: number;

  @IsNotEmpty()
  @IsString()
  link: string;
}
