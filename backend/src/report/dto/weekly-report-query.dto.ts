import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class WeeklyReportQueryDto {
  @ApiProperty({ example: '2030-08-20' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date deve estar no formato YYYY-MM-DD',
  })
  date: string;
}
