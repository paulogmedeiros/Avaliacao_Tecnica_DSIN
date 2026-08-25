import { Module } from '@nestjs/common';
import { ReportController } from './report.controller.js';
import { ReportRepository } from './report.repository.js';
import { ReportService } from './report.service.js';

@Module({
  controllers: [ReportController],
  providers: [ReportRepository, ReportService],
})
export class ReportModule {}
