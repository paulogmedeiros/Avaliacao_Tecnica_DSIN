import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller.js';
import { AppointmentRepository } from './appointment.repository.js';
import { AppointmentService } from './appointment.service.js';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentRepository],
})
export class AppointmentModule {}
