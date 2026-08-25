import { AppointmentStatus } from '../generated/prisma/client.js';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReportRepository } from './report.repository.js';

describe('ReportRepository', () => {
  it('consulta as agendas do período com cliente e snapshots dos serviços', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      appointment: { findMany },
      businessHour: { findMany: jest.fn() },
    } as unknown as PrismaService;
    const repository = new ReportRepository(prisma);
    const start = new Date('2030-08-19T03:00:00.000Z');
    const end = new Date('2030-08-26T03:00:00.000Z');

    await repository.findAppointmentsInRange(start, end);

    expect(findMany).toHaveBeenCalledWith({
      where: { startAt: { gte: start, lt: end } },
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
  });

  it('lista os horários de funcionamento', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      appointment: { findMany: jest.fn() },
      businessHour: { findMany },
    } as unknown as PrismaService;
    const repository = new ReportRepository(prisma);

    await repository.findBusinessHours();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { dayOfWeek: 'asc' } });
    expect(AppointmentStatus.CANCELED).toBe('CANCELED');
  });
});
