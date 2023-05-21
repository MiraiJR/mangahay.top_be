import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { JwtAuthorizationd } from '../../common/guards/jwt-guard';
import { Roles, RolesGuard } from '../../common/guards/check-role';
import { CreateReportDTO } from './DTO/create-report';
import { IdUser } from '../user/decorators/id-user';
import { UserRole } from '../user/user.role';

@Controller('api/report')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private logger: Logger = new Logger(ReportController.name),
  ) {}

  @UseGuards(JwtAuthorizationd)
  @Post('create')
  async createReport(
    @IdUser() id_user: number,
    @Body(new ValidationPipe()) body: CreateReportDTO,
    @Res() response: Response,
  ) {
    try {
      this.reportService.create({
        ...body,
        reporter: id_user,
      });

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Báo cáo thành công!',
        result: {},
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthorizationd, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('/update/:id_report')
  async updatedReport(
    @Param('id_report', new ParseIntPipe()) id_report: number,
    @Query() query: any,
    @Res() response: Response,
  ) {
    try {
      query.is_resolve = query.is_resolve === 'true' ? true : false;
      this.reportService.updateReport(id_report, query);

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thao tác thành công!',
        result: {},
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status,
        success: false,
        message: error.message,
      });
    }
  }
}
