import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAppointmentsInRange(startAt: Date, endAt: Date) {
    return await this.prisma.appointment.findMany({
      where: { startAt: { gte: startAt, lt: endAt } },
      select: {
        id: true,
        clientId: true,
        status: true,
        startAt: true,
        endAt: true,
        client: { select: { id: true, createdAt: true } },
        services: {
          select: {
            serviceId: true,
            serviceNameSnapshot: true,
            servicePriceSnapshot: true,
            serviceDurationSnapshot: true,
            status: true,
          },
        },
      },
    });
  }

  async findBusinessHours() {
    return await this.prisma.businessHour.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
