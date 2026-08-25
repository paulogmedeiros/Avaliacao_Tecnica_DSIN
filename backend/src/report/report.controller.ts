import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { WeeklyReportQueryDto } from './dto/weekly-report-query.dto.js';
import { ReportService } from './report.service.js';

@ApiBearerAuth()
@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Roles(UserRole.ADMIN)
  @Get('weekly')
  async weekly(@Query() query: WeeklyReportQueryDto) {
    return await this.service.getWeekly(query.date);
  }
}
