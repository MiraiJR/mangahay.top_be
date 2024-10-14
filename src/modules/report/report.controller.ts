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
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles, RoleGuard } from '../../common/guards/role.guard';
import { CreateReportDTO } from './DTO/create-report';
import { UserRole } from '../user/user.role';
import UserId from '../../common/decorators/userId';

@Controller('api/report')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private logger: Logger = new Logger(ReportController.name),
  ) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async createReport(
    @UserId() id_user: number,
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

  @UseGuards(AuthGuard, RoleGuard)
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
