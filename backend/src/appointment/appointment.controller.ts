import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { AppointmentService } from './appointment.service.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { HistoryQueryDto } from './dto/history-query.dto.js';

interface AuthenticatedRequest extends Request {
  user: { sub: string; role: UserRole };
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

  @Get('history')
  async findHistory(
    @Req() request: AuthenticatedRequest,
    @Query() query: HistoryQueryDto,
  ) {
    return await this.service.findHistory(request.user.sub, query);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin')
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return await this.service.findById(id, request.user.sub, request.user.role);
  }

  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateAppointmentDto,
  ) {
    return await this.service.create(request.user.sub, dto);
  }
}
