import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus, UserRole } from '../../generated/prisma/client.js';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 }) statusCode!: number;
  @ApiProperty({ example: 'Dados inválidos' }) message!: string | string[];
  @ApiProperty({ example: 'Bad Request' }) error!: string;
}

export class UserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '0198d000-0000-7000-8000-000000000001',
  })
  id!: string;
  @ApiProperty({ example: 'Maria Souza' }) name!: string;
  @ApiProperty({ example: 'maria.souza@example.com' }) email!: string;
  @ApiProperty({ example: '(11) 99999-9999' }) phone!: string;
  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT }) role!: UserRole;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
}

export class ServiceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Hidratação' }) name!: string;
  @ApiPropertyOptional({
    nullable: true,
    example: 'Hidratação profunda dos fios',
  })
  description!: string | null;
  @ApiProperty({
    example: '55.00',
    description: 'Preço em reais, retornado como decimal serializado.',
  })
  price!: string;
  @ApiProperty({ example: 45 }) durationMinutes!: number;
  @ApiProperty({ example: true }) isActive!: boolean;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
}

export class AppointmentClientResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Maria Souza' }) name!: string;
  @ApiProperty({ example: 'maria.souza@example.com' }) email!: string;
  @ApiProperty({ example: '(11) 99999-9999' }) phone!: string;
}

export class AppointmentServiceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) appointmentId!: string;
  @ApiProperty({ format: 'uuid' }) serviceId!: string;
  @ApiProperty({ example: 1 }) sequence!: number;
  @ApiProperty({ example: 'Hidratação' }) serviceNameSnapshot!: string;
  @ApiProperty({ example: '55.00' }) servicePriceSnapshot!: string;
  @ApiProperty({ example: 45 }) serviceDurationSnapshot!: number;
  @ApiProperty({ enum: AppointmentStatus }) status!: AppointmentStatus;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
}

export class AppointmentResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) clientId!: string;
  @ApiProperty({ format: 'date-time', example: '2030-08-20T11:30:00.000Z' })
  startAt!: string;
  @ApiProperty({ format: 'date-time', example: '2030-08-20T12:15:00.000Z' })
  endAt!: string;
  @ApiProperty({ enum: AppointmentStatus }) status!: AppointmentStatus;
  @ApiProperty({ type: () => [AppointmentServiceResponseDto] })
  services!: AppointmentServiceResponseDto[];
  @ApiPropertyOptional({ type: () => AppointmentClientResponseDto })
  client?: AppointmentClientResponseDto;
  @ApiProperty({ format: 'date-time' }) createdAt!: string;
  @ApiProperty({ format: 'date-time' }) updatedAt!: string;
}

export class AvailabilitySlotResponseDto {
  @ApiProperty({ format: 'date-time', example: '2030-08-20T11:00:00.000Z' })
  startAt!: string;
  @ApiProperty({ format: 'date-time', example: '2030-08-20T11:45:00.000Z' })
  endAt!: string;
}

export class AvailabilitySuggestionResponseDto {
  @ApiProperty({ format: 'date', example: '2030-08-21' }) date!: string;
  @ApiProperty({ format: 'uuid' }) appointmentId!: string;
  @ApiProperty({
    example:
      'Você já possui um agendamento nesta semana. Deseja marcar os novos serviços para 21/08/2030?',
  })
  message!: string;
}

export class AvailabilityResponseDto {
  @ApiProperty({ format: 'date', example: '2030-08-20' }) date!: string;
  @ApiProperty({ example: 45 }) durationMinutes!: number;
  @ApiPropertyOptional({
    type: () => AvailabilitySuggestionResponseDto,
    nullable: true,
  })
  suggestion!: AvailabilitySuggestionResponseDto | null;
  @ApiProperty({ type: () => [AvailabilitySlotResponseDto] })
  slots!: AvailabilitySlotResponseDto[];
}

class StatusCountersDto {
  @ApiProperty({ example: 5 }) total!: number;
  @ApiProperty({ example: 2 }) pending!: number;
  @ApiProperty({ example: 2 }) confirmed!: number;
  @ApiProperty({ example: 1 }) completed!: number;
  @ApiProperty({ example: 0 }) canceled!: number;
}

class AppointmentMetricsDto extends StatusCountersDto {
  @ApiProperty({
    example: 0,
    description: 'Percentual de agendamentos cancelados.',
  })
  cancellationRate!: number;
}

class RevenueMetricsDto {
  @ApiProperty({ example: '110.00' }) completed!: string;
  @ApiProperty({ example: '275.00' }) expected!: string;
  @ApiProperty({ example: '55.00' }) lostByCancellation!: string;
}

class OccupancyMetricsDto {
  @ApiProperty({ example: 2880 }) availableMinutes!: number;
  @ApiProperty({ example: 345 }) scheduledMinutes!: number;
  @ApiProperty({ example: 90 }) completedMinutes!: number;
  @ApiProperty({ example: 11.98 }) occupancyRate!: number;
}

class ClientMetricsDto {
  @ApiProperty({ example: 4 }) uniqueScheduled!: number;
  @ApiProperty({ example: 1 }) uniqueCompleted!: number;
  @ApiProperty({ example: 2 }) newClients!: number;
}

class TopServiceDto {
  @ApiProperty({ format: 'uuid' }) serviceId!: string;
  @ApiProperty({ example: 'Hidratação' }) name!: string;
  @ApiProperty({ example: 3 }) quantity!: number;
  @ApiProperty({ example: 1 }) completedQuantity!: number;
  @ApiProperty({ example: '55.00' }) completedRevenue!: string;
}

class WeeklyComparisonDto {
  @ApiProperty({ example: 25 }) appointmentsChangePercentage!: number;
  @ApiProperty({ example: 10 }) completedRevenueChangePercentage!: number;
  @ApiProperty({ example: 2.5 }) occupancyChangePercentage!: number;
  @ApiProperty({ example: -5 }) cancellationRateChange!: number;
}

class WeeklyPeriodDto {
  @ApiProperty({ format: 'date', example: '2030-08-19' }) startDate!: string;
  @ApiProperty({ format: 'date', example: '2030-08-24' }) endDate!: string;
}

export class WeeklyReportResponseDto {
  @ApiProperty({ type: () => WeeklyPeriodDto }) period!: WeeklyPeriodDto;
  @ApiProperty({ type: () => AppointmentMetricsDto })
  appointments!: AppointmentMetricsDto;
  @ApiProperty({ type: () => RevenueMetricsDto }) revenue!: RevenueMetricsDto;
  @ApiProperty({ type: () => StatusCountersDto }) services!: StatusCountersDto;
  @ApiProperty({ type: () => OccupancyMetricsDto })
  occupancy!: OccupancyMetricsDto;
  @ApiProperty({ type: () => ClientMetricsDto }) clients!: ClientMetricsDto;
  @ApiProperty({ type: () => [TopServiceDto] }) topServices!: TopServiceDto[];
  @ApiProperty({ type: () => WeeklyComparisonDto })
  comparison!: WeeklyComparisonDto;
}
