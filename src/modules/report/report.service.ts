import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { IReport } from './report.interface';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async create(report: IReport) {
    return await this.reportRepository.save({
      ...report,
    });
  }

  async getReports(query: any) {
    return query.type === 'all'
      ? await this.reportRepository
          .createQueryBuilder('reports')
          .where('reports.type = :type', { type: query.type })
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .getMany()
      : await this.reportRepository
          .createQueryBuilder('reports')
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .getMany();
  }
}
