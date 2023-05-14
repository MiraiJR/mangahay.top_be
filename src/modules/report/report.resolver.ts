import { Args, Query, Resolver } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { Logger } from '@nestjs/common';
import { ReportDTO } from './DTO/report-dto';

@Resolver()
export class ReportResolver {
  constructor(
    private reportService: ReportService,
    private logger: Logger = new Logger(ReportResolver.name),
  ) {}

  @Query(() => [ReportDTO])
  async getReports(@Args('type', { type: () => String }) type: string) {
    try {
      return await this.reportService.getReports({
        type,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
