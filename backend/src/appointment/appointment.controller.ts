import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { AppointmentService } from './appointment.service.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { HistoryQueryDto } from './dto/history-query.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { UpdateAppointmentServiceStatusDto } from './dto/update-appointment-service-status.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import {
  ApiAdminListAppointments,
  ApiAdminUpdateAppointment,
  ApiAdminUpdateAppointmentServiceStatus,
  ApiAdminUpdateAppointmentStatus,
  ApiAppointmentAvailability,
  ApiAppointmentDetails,
  ApiAppointmentHistory,
  ApiClientCancelAppointment,
  ApiClientUpdateAppointment,
  ApiCreateAppointment,
} from '../swagger/decorators/appointment.swagger.js';
import { SwaggerTags } from '../swagger/swagger.tags.js';

interface AuthenticatedRequest extends Request {
  user: { sub: string; role: UserRole };
}

@ApiBearerAuth()
@ApiTags(SwaggerTags.APPOINTMENT)
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}

  @Get('availability')
  @ApiAppointmentAvailability()
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
  @ApiAppointmentHistory()
  async findHistory(
    @Req() request: AuthenticatedRequest,
    @Query() query: HistoryQueryDto,
  ) {
    return await this.service.findHistory(request.user.sub, query);
  }

  @Roles(UserRole.ADMIN)
  @Get('admin')
  @ApiAdminListAppointments()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiAppointmentDetails()
  async findById(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return await this.service.findById(id, request.user.sub, request.user.role);
  }

  @Patch(':id')
  @ApiClientUpdateAppointment()
  async updateClient(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return await this.service.updateClient(id, request.user.sub, dto);
  }

  @Patch(':id/cancel')
  @ApiClientCancelAppointment()
  async cancelClient(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return await this.service.cancelClient(id, request.user.sub);
  }

  @Roles(UserRole.ADMIN)
  @Patch('admin/:id')
  @ApiAdminUpdateAppointment()
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return await this.service.updateAdmin(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/status')
  @ApiAdminUpdateAppointmentStatus()
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return await this.service.updateStatus(id, dto.status);
  }

  @Roles(UserRole.ADMIN)
  @Patch('admin/:appointmentId/services/:appointmentServiceId/status')
  @ApiAdminUpdateAppointmentServiceStatus()
  async updateServiceStatus(
    @Param('appointmentId') appointmentId: string,
    @Param('appointmentServiceId') appointmentServiceId: string,
    @Body() dto: UpdateAppointmentServiceStatusDto,
  ) {
    return await this.service.updateServiceStatus(
      appointmentId,
      appointmentServiceId,
      dto.status,
    );
  }

  @Post()
  @ApiCreateAppointment()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateAppointmentDto,
  ) {
    return await this.service.create(request.user.sub, dto);
  }
}
