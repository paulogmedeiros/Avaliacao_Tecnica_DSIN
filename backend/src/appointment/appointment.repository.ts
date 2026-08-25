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

export interface AppointmentScheduleUpdateData {
  appointmentId: string;
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

const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
];

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

  async updateScheduleIfAvailable(data: AppointmentScheduleUpdateData) {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const current = await transaction.appointment.findUnique({
            where: { id: data.appointmentId },
            select: { status: true },
          });
          if (
            !current ||
            !ACTIVE_APPOINTMENT_STATUSES.includes(current.status)
          ) {
            return null;
          }

          const conflict = await transaction.appointment.findFirst({
            where: {
              id: { not: data.appointmentId },
              status: { not: AppointmentStatus.CANCELED },
              startAt: { lt: data.endAt },
              endAt: { gt: data.startAt },
            },
            select: { id: true },
          });
          if (conflict) return null;

          await transaction.appointmentService.updateMany({
            where: { appointmentId: data.appointmentId },
            data: { sequence: { increment: 10000 } },
          });
          await transaction.appointmentService.deleteMany({
            where: {
              appointmentId: data.appointmentId,
              serviceId: {
                notIn: data.services.map((service) => service.serviceId),
              },
            },
          });

          for (const service of data.services) {
            await transaction.appointmentService.upsert({
              where: {
                appointmentId_serviceId: {
                  appointmentId: data.appointmentId,
                  serviceId: service.serviceId,
                },
              },
              update: { sequence: service.sequence },
              create: { ...service, appointmentId: data.appointmentId },
            });
          }

          return await transaction.appointment.update({
            where: { id: data.appointmentId },
            data: { startAt: data.startAt, endAt: data.endAt },
            include: appointmentDetailsInclude,
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

  async cancelIfActive(id: string) {
    return await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointment.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!current || !ACTIVE_APPOINTMENT_STATUSES.includes(current.status)) {
        return null;
      }
      await transaction.appointmentService.updateMany({
        where: { appointmentId: id },
        data: { status: AppointmentStatus.CANCELED },
      });
      return await transaction.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELED },
        include: appointmentDetailsInclude,
      });
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    return await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointment.findUnique({
        where: { id },
        include: { services: { select: { status: true } } },
      });
      if (!current || !ACTIVE_APPOINTMENT_STATUSES.includes(current.status)) {
        return null;
      }
      if (
        status === AppointmentStatus.COMPLETED &&
        current.services.some(
          (service) => service.status !== AppointmentStatus.COMPLETED,
        )
      ) {
        return null;
      }
      if (status === AppointmentStatus.CANCELED) {
        await transaction.appointmentService.updateMany({
          where: { appointmentId: id },
          data: { status: AppointmentStatus.CANCELED },
        });
      }
      return await transaction.appointment.update({
        where: { id },
        data: { status },
        include: appointmentDetailsInclude,
      });
    });
  }

  async findAppointmentService(appointmentId: string, id: string) {
    return await this.prisma.appointmentService.findFirst({
      where: { id, appointmentId },
      include: { appointment: { select: { status: true } } },
    });
  }

  async updateAppointmentServiceStatus(
    appointmentId: string,
    id: string,
    status: AppointmentStatus,
  ) {
    return await this.prisma.$transaction(async (transaction) => {
      const current = await transaction.appointmentService.findFirst({
        where: { id, appointmentId },
        include: { appointment: { select: { status: true } } },
      });
      if (
        !current ||
        !ACTIVE_APPOINTMENT_STATUSES.includes(current.appointment.status) ||
        !ACTIVE_APPOINTMENT_STATUSES.includes(current.status)
      ) {
        return null;
      }
      return await transaction.appointmentService.update({
        where: { id },
        data: { status },
        include: { service: true },
      });
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
