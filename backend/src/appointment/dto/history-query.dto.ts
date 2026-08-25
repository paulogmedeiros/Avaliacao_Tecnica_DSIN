import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class HistoryQueryDto {
  @ApiPropertyOptional({ example: '2030-08-01' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate deve estar no formato YYYY-MM-DD',
  })
  startDate?: string;

  @ApiPropertyOptional({ example: '2030-08-31' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate deve estar no formato YYYY-MM-DD',
  })
  endDate?: string;
}
