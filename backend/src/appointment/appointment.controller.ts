import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AppointmentService } from './appointment.service.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';

interface AuthenticatedRequest extends Request {
  user: { sub: string };
}

@ApiBearerAuth()
@ApiTags('Appointment')
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}

  @Get('availability')
  async findAvailability(
    @Req() request: AuthenticatedRequest,
    @Query() query: AvailabilityQueryDto,
  ) {
    return await this.service.findAvailability(
      request.user.sub,
      query.date,
      query.serviceIds,
    );
  }

  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateAppointmentDto,
  ) {
    return await this.service.create(request.user.sub, dto);
  }
}
