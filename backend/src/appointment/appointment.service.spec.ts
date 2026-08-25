import { BadRequestException, ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AppointmentRepository } from './appointment.repository.js';
import { AppointmentService } from './appointment.service.js';

const services = [
  {
    id: '0198d000-0000-7000-8000-000000000001',
    name: 'Corte',
    price: 50,
    durationMinutes: 45,
    isActive: true,
  },
  {
    id: '0198d000-0000-7000-8000-000000000002',
    name: 'Escova',
    price: 40,
    durationMinutes: 30,
    isActive: true,
  },
];

const tuesdayHours = {
  dayOfWeek: 'TUESDAY',
  openingTime: new Date('1970-01-01T08:00:00.000Z'),
  lunchStart: new Date('1970-01-01T12:00:00.000Z'),
  lunchEnd: new Date('1970-01-01T13:00:00.000Z'),
  closingTime: new Date('1970-01-01T18:00:00.000Z'),
};

describe('AppointmentService', () => {
  let repository: jest.Mocked<AppointmentRepository>;
  let service: AppointmentService;

  beforeEach(() => {
    repository = {
      findActiveServicesByIds: jest.fn(),
      findBusinessHour: jest.fn(),
      findAppointmentsBetween: jest.fn(),
      createIfAvailable: jest.fn(),
    } as unknown as jest.Mocked<AppointmentRepository>;
    service = new AppointmentService(repository);
    repository.findActiveServicesByIds.mockImplementation((ids) =>
      Promise.resolve(
        services.filter((item) => ids.includes(item.id)) as never,
      ),
    );
    repository.findBusinessHour.mockResolvedValue(tuesdayHours as never);
    repository.findAppointmentsBetween.mockResolvedValue([] as never);
  });

  it('lista inícios de 30 em 30 minutos respeitando uma duração de 45 minutos', async () => {
    const result = await service.findAvailability('2030-08-20', [
      services[0].id,
    ]);

    expect(result.durationMinutes).toBe(45);
    expect(result.slots[0]).toEqual({
      startAt: new Date('2030-08-20T11:00:00.000Z'),
      endAt: new Date('2030-08-20T11:45:00.000Z'),
    });
    expect(result.slots).toContainEqual({
      startAt: new Date('2030-08-20T16:30:00.000Z'),
      endAt: new Date('2030-08-20T17:15:00.000Z'),
    });
    expect(result.slots).not.toContainEqual({
      startAt: new Date('2030-08-20T14:30:00.000Z'),
      endAt: new Date('2030-08-20T15:15:00.000Z'),
    });
  });

  it('remove horários que se sobrepõem a uma agenda existente', async () => {
    repository.findAppointmentsBetween.mockResolvedValue([
      {
        startAt: new Date('2030-08-20T11:30:00.000Z'),
        endAt: new Date('2030-08-20T12:15:00.000Z'),
      },
    ] as never);

    const result = await service.findAvailability('2030-08-20', [
      services[0].id,
    ]);

    expect(
      result.slots.map((slot) => slot.startAt.toISOString()),
    ).not.toContain('2030-08-20T11:00:00.000Z');
    expect(
      result.slots.map((slot) => slot.startAt.toISOString()),
    ).not.toContain('2030-08-20T11:30:00.000Z');
  });

  it('rejeita domingo por não possuir horário de funcionamento', async () => {
    await expect(
      service.findAvailability('2030-08-18', [services[0].id]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejeita serviço repetido', async () => {
    await expect(
      service.findAvailability('2030-08-20', [services[0].id, services[0].id]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cria a agenda com duração total, ordem e snapshots dos serviços', async () => {
    repository.createIfAvailable.mockImplementation((data) =>
      Promise.resolve(data as never),
    );

    const result = await service.create(
      '0198d000-0000-7000-8000-000000000099',
      {
        startAt: '2030-08-20T08:30:00-03:00',
        serviceIds: [services[0].id, services[1].id],
      },
    );

    expect(result).toMatchObject({
      clientId: '0198d000-0000-7000-8000-000000000099',
      startAt: new Date('2030-08-20T11:30:00.000Z'),
      endAt: new Date('2030-08-20T12:45:00.000Z'),
      services: [
        {
          serviceId: services[0].id,
          sequence: 1,
          serviceNameSnapshot: 'Corte',
          serviceDurationSnapshot: 45,
        },
        {
          serviceId: services[1].id,
          sequence: 2,
          serviceNameSnapshot: 'Escova',
          serviceDurationSnapshot: 30,
        },
      ],
    });
  });

  it('rejeita criação que atravessa o horário de almoço', async () => {
    await expect(
      service.create('0198d000-0000-7000-8000-000000000099', {
        startAt: '2030-08-20T11:30:00-03:00',
        serviceIds: [services[0].id],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejeita criação quando o horário foi ocupado antes da confirmação', async () => {
    repository.createIfAvailable.mockResolvedValue(null);

    await expect(
      service.create('0198d000-0000-7000-8000-000000000099', {
        startAt: '2030-08-20T08:30:00-03:00',
        serviceIds: [services[0].id],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
