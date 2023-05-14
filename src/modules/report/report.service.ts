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
      ? await await this.reportRepository.manager
          .query(`select rp.id as id, rp.is_resolve as is_resolve, rp.type as type, rp.detail_report as detail_report, rp.errors as errors, rp.id_object as id_object, rp.link as link, u.fullname as fullname, u.email as email
          from public."report" as rp join public."user" as u on rp.reporter = u.id
         `)
      : await await this.reportRepository.manager
          .query(`select rp.id as id, rp.is_resolve as is_resolve, rp.type as type, rp.detail_report as detail_report, rp.errors as errors, rp.id_object as id_object, rp.link as link, u.fullname as fullname, u.email as email
            from public."report" as rp join public."user" as u on rp.reporter = u.id where rp.type = '${query.type}'
            `);
  }

  async updateReport(id_report: number, report: any) {
    return await this.reportRepository.save({
      id: id_report,
      ...report,
    });
  }
}
