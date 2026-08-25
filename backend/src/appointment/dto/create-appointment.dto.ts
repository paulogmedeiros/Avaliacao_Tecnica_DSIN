import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsISO8601,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: '2030-08-20T08:30:00-03:00' })
  @IsISO8601({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/, {
    message: 'startAt deve informar o fuso horário',
  })
  startAt!: string;

  @ApiProperty({
    type: [String],
    example: ['0198d000-0000-7000-8000-000000000001'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  serviceIds!: string[];
}
