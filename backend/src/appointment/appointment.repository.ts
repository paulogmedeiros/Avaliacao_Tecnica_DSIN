import { Injectable } from '@nestjs/common';
import {
  AppointmentStatus,
  DayOfWeek,
  Prisma,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const appointmentDetailsInclude = {
  client: {
    select: { id: true, name: true, email: true, phone: true, role: true },
  },
  services: {
    orderBy: { sequence: 'asc' as const },
    include: { service: true },
  },
} satisfies Prisma.AppointmentInclude;

export interface AppointmentCreationData {
  id: string;
  clientId: string;
  startAt: Date;
  endAt: Date;
  services: Array<{
    id: string;
    serviceId: string;
    sequence: number;
    serviceNameSnapshot: string;
    servicePriceSnapshot: Prisma.Decimal;
    serviceDurationSnapshot: number;
  }>;
}

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveServicesByIds(ids: string[]) {
    return await this.prisma.service.findMany({
      where: { id: { in: ids }, isActive: true },
    });
  }

  async findBusinessHour(dayOfWeek: DayOfWeek) {
    return await this.prisma.businessHour.findUnique({ where: { dayOfWeek } });
  }

  async findAppointmentsBetween(startAt: Date, endAt: Date) {
    return await this.prisma.appointment.findMany({
      where: {
        status: { not: AppointmentStatus.CANCELED },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { startAt: true, endAt: true },
      orderBy: { startAt: 'asc' },
    });
  }

  async findFirstUpcomingByClientInRange(
    clientId: string,
    startAt: Date,
    endAt: Date,
    now: Date,
  ) {
    const effectiveStart = startAt > now ? startAt : now;
    return await this.prisma.appointment.findFirst({
      where: {
        clientId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startAt: { gte: effectiveStart, lt: endAt },
      },
      select: { id: true, startAt: true },
      orderBy: { startAt: 'asc' },
    });
  }

  async findHistoryByClient(clientId: string, startAt?: Date, endAt?: Date) {
    const dateFilter =
      startAt || endAt
        ? {
            startAt: {
              ...(startAt ? { gte: startAt } : {}),
              ...(endAt ? { lt: endAt } : {}),
            },
          }
        : {};

    return await this.prisma.appointment.findMany({
      where: { clientId, ...dateFilter },
      include: appointmentDetailsInclude,
      orderBy: { startAt: 'desc' },
    });
  }

  async findAll() {
    return await this.prisma.appointment.findMany({
      include: appointmentDetailsInclude,
      orderBy: { startAt: 'asc' },
    });
  }

  async findById(id: string) {
    return await this.prisma.appointment.findUnique({
      where: { id },
      include: appointmentDetailsInclude,
    });
  }

  async createIfAvailable(data: AppointmentCreationData) {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const conflict = await transaction.appointment.findFirst({
            where: {
              status: { not: AppointmentStatus.CANCELED },
              startAt: { lt: data.endAt },
              endAt: { gt: data.startAt },
            },
            select: { id: true },
          });

          if (conflict) return null;

          return await transaction.appointment.create({
            data: {
              id: data.id,
              clientId: data.clientId,
              startAt: data.startAt,
              endAt: data.endAt,
              services: { create: data.services },
            },
            include: { services: { orderBy: { sequence: 'asc' } } },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        return null;
      }
      throw error;
    }
  }
}
