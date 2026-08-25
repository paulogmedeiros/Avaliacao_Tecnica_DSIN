import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AppointmentStatus } from '../../generated/prisma/client.js';

const ADMIN_APPOINTMENT_STATUSES = [
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELED,
] as const;

export class UpdateAppointmentStatusDto {
  @ApiProperty({ enum: ADMIN_APPOINTMENT_STATUSES })
  @IsIn(ADMIN_APPOINTMENT_STATUSES)
  status!: (typeof ADMIN_APPOINTMENT_STATUSES)[number];
}
