import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
  Matches,
} from 'class-validator';

export class AvailabilityQueryDto {
  @ApiProperty({ example: '2030-08-20' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date deve estar no formato YYYY-MM-DD',
  })
  date!: string;

  @ApiProperty({
    example:
      '0198d000-0000-7000-8000-000000000001,0198d000-0000-7000-8000-000000000002',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : value,
  )
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  serviceIds!: string[];
}
