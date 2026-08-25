import { AppointmentStatus, DayOfWeek } from '../generated/prisma/client.js';
import { jest } from '@jest/globals';
import { ReportRepository } from './report.repository.js';
import { ReportService } from './report.service.js';

describe('ReportService', () => {
  const repository = {
    findAppointmentsInRange: jest.fn(),
    findBusinessHours: jest.fn(),
  } as unknown as jest.Mocked<ReportRepository>;
  const service = new ReportService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('calcula os indicadores da semana e compara com a anterior', async () => {
    repository.findAppointmentsInRange
      .mockResolvedValueOnce([
        appointment({
          id: 'completed',
          clientId: 'client-1',
          status: AppointmentStatus.COMPLETED,
          startAt: new Date('2030-08-19T11:00:00.000Z'),
          endAt: new Date('2030-08-19T11:45:00.000Z'),
          clientCreatedAt: new Date('2030-08-19T10:00:00.000Z'),
          serviceStatus: AppointmentStatus.COMPLETED,
          price: '50.00',
          duration: 45,
          serviceId: 'haircut',
          serviceName: 'Corte',
        }),
        appointment({
          id: 'canceled',
          clientId: 'client-2',
          status: AppointmentStatus.CANCELED,
          startAt: new Date('2030-08-20T11:00:00.000Z'),
          endAt: new Date('2030-08-20T11:40:00.000Z'),
          serviceStatus: AppointmentStatus.CANCELED,
          price: '40.00',
          duration: 40,
          serviceId: 'nails',
          serviceName: 'Unhas',
        }),
        appointment({
          id: 'confirmed',
          clientId: 'client-1',
          status: AppointmentStatus.CONFIRMED,
          startAt: new Date('2030-08-21T11:00:00.000Z'),
          endAt: new Date('2030-08-21T11:30:00.000Z'),
          serviceStatus: AppointmentStatus.CONFIRMED,
          price: '30.00',
          duration: 30,
          serviceId: 'haircut',
          serviceName: 'Corte',
        }),
      ] as never)
      .mockResolvedValueOnce([
        appointment({
          id: 'previous',
          clientId: 'client-3',
          status: AppointmentStatus.COMPLETED,
          startAt: new Date('2030-08-12T11:00:00.000Z'),
          endAt: new Date('2030-08-12T11:30:00.000Z'),
          serviceStatus: AppointmentStatus.COMPLETED,
          price: '25.00',
          duration: 30,
          serviceId: 'nails',
          serviceName: 'Unhas',
        }),
      ] as never);
    repository.findBusinessHours.mockResolvedValue([
      businessHour(DayOfWeek.MONDAY, 18),
      businessHour(DayOfWeek.SATURDAY, 15),
    ] as never);

    const result = await service.getWeekly('2030-08-20');

    expect(result.period).toEqual({
      startDate: '2030-08-19',
      endDate: '2030-08-25',
    });
    expect(result.appointments).toEqual({
      total: 3,
      pending: 0,
      confirmed: 1,
      completed: 1,
      canceled: 1,
      cancellationRate: 33.33,
    });
    expect(result.revenue).toEqual({
      completed: '50.00',
      expected: '30.00',
      lostByCancellation: '40.00',
    });
    expect(result.services).toEqual({
      total: 3,
      pending: 0,
      confirmed: 1,
      completed: 1,
      canceled: 1,
    });
    expect(result.occupancy).toEqual({
      availableMinutes: 900,
      scheduledMinutes: 75,
      completedMinutes: 45,
      occupancyRate: 8.33,
    });
    expect(result.clients).toEqual({
      uniqueScheduled: 1,
      uniqueCompleted: 1,
      newClients: 1,
    });
    expect(result.topServices[0]).toEqual({
      serviceId: 'haircut',
      name: 'Corte',
      quantity: 2,
      completedQuantity: 1,
      completedRevenue: '50.00',
    });
    expect(result.comparison).toEqual({
      appointmentsChangePercentage: 200,
      completedRevenueChangePercentage: 100,
      occupancyChangePercentage: 150,
      cancellationRateChange: 33.33,
    });
  });

  it('rejeita uma data inexistente', async () => {
    await expect(service.getWeekly('2030-02-31')).rejects.toThrow(
      'A data informada é inválida',
    );
  });

  it('retorna variações zeradas quando as duas semanas não têm movimento', async () => {
    repository.findAppointmentsInRange.mockResolvedValue([] as never);
    repository.findBusinessHours.mockResolvedValue([] as never);

    const result = await service.getWeekly('2030-08-20');

    expect(result.occupancy.occupancyRate).toBe(0);
    expect(result.comparison).toEqual({
      appointmentsChangePercentage: 0,
      completedRevenueChangePercentage: 0,
      occupancyChangePercentage: 0,
      cancellationRateChange: 0,
    });
  });
});

function appointment(input: {
  id: string;
  clientId: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  serviceStatus: AppointmentStatus;
  price: string;
  duration: number;
  serviceId: string;
  serviceName: string;
  clientCreatedAt?: Date;
}) {
  return {
    id: input.id,
    clientId: input.clientId,
    status: input.status,
    startAt: input.startAt,
    endAt: input.endAt,
    client: {
      id: input.clientId,
      createdAt: input.clientCreatedAt ?? new Date('2029-01-01T00:00:00.000Z'),
    },
    services: [
      {
        serviceId: input.serviceId,
        serviceNameSnapshot: input.serviceName,
        servicePriceSnapshot: input.price,
        serviceDurationSnapshot: input.duration,
        status: input.serviceStatus,
      },
    ],
  };
}

function businessHour(dayOfWeek: DayOfWeek, closingHour: number) {
  return {
    dayOfWeek,
    openingTime: new Date('1970-01-01T08:00:00.000Z'),
    lunchStart: new Date('1970-01-01T12:00:00.000Z'),
    lunchEnd: new Date('1970-01-01T13:00:00.000Z'),
    closingTime: new Date(`1970-01-01T${closingHour}:00:00.000Z`),
  };
}
