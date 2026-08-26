import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { WeeklyReportQueryDto } from './dto/weekly-report-query.dto.js';
import { ReportService } from './report.service.js';
import { ApiWeeklyReport } from '../swagger/decorators/report.swagger.js';
import { SwaggerTags } from '../swagger/swagger.tags.js';

@ApiBearerAuth()
@ApiTags(SwaggerTags.REPORT)
@Controller('report')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Roles(UserRole.ADMIN)
  @Get('weekly')
  @ApiWeeklyReport()
  async weekly(@Query() query: WeeklyReportQueryDto) {
    return await this.service.getWeekly(query.date);
  }
}
