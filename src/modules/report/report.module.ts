import { Logger, Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportResolver } from './report.resolver';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, JwtModule, TypeOrmModule.forFeature([Report])],
  controllers: [ReportController],
  providers: [ReportService, ReportResolver, Logger],
  exports: [ReportService],
})
export class ReportModule {}
