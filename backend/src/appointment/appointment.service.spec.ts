import { BadRequestException, ConflictException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { AppointmentRepository } from './appointment.repository.js';
import { AppointmentService } from './appointment.service.js';
import { UserRole } from '../user/enum/role.user.js';
import { AppointmentStatus } from '../generated/prisma/client.js';

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
      findFirstUpcomingByClientInRange: jest.fn(),
      findHistoryByClient: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateScheduleIfAvailable: jest.fn(),
      cancelIfActive: jest.fn(),
      updateStatus: jest.fn(),
      findAppointmentService: jest.fn(),
      updateAppointmentServiceStatus: jest.fn(),
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
    repository.findFirstUpcomingByClientInRange.mockResolvedValue(null);
  });

  it('lista inícios de 30 em 30 minutos respeitando uma duração de 45 minutos', async () => {
    const result = await service.findAvailability('client-id', '2030-08-20', [
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

    const result = await service.findAvailability('client-id', '2030-08-20', [
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
      service.findAvailability('client-id', '2030-08-18', [services[0].id]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejeita serviço repetido', async () => {
    await expect(
      service.findAvailability('client-id', '2030-08-20', [
        services[0].id,
        services[0].id,
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sugere a primeira agenda futura do cliente na mesma semana', async () => {
    repository.findFirstUpcomingByClientInRange.mockResolvedValue({
      id: 'appointment-id',
      startAt: new Date('2030-08-20T14:00:00.000Z'),
    });

    const result = await service.findAvailability('client-id', '2030-08-22', [
      services[0].id,
    ]);

    expect(result.suggestion).toEqual({
      date: '2030-08-20',
      appointmentId: 'appointment-id',
      message:
        'Você já possui um agendamento nesta semana. Deseja marcar os novos serviços para 20/08/2030?',
    });
  });

  it('não sugere quando a data consultada já é a data da agenda', async () => {
    repository.findFirstUpcomingByClientInRange.mockResolvedValue({
      id: 'appointment-id',
      startAt: new Date('2030-08-20T14:00:00.000Z'),
    });

    const result = await service.findAvailability('client-id', '2030-08-20', [
      services[0].id,
    ]);

    expect(result.suggestion).toBeNull();
  });

  it('consulta o histórico do cliente usando o período local completo', async () => {
    repository.findHistoryByClient.mockResolvedValue([] as never);

    await service.findHistory('client-id', {
      startDate: '2030-08-20',
      endDate: '2030-08-22',
    });

    expect(repository.findHistoryByClient.mock.calls[0]).toEqual([
      'client-id',
      new Date('2030-08-20T03:00:00.000Z'),
      new Date('2030-08-23T03:00:00.000Z'),
    ]);
  });

  it('rejeita período de histórico invertido', async () => {
    await expect(
      service.findHistory('client-id', {
        startDate: '2030-08-22',
        endDate: '2030-08-20',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('delega a listagem completa de agendas', async () => {
    repository.findAll.mockResolvedValue([{ id: 'appointment-id' }] as never);
    await expect(service.findAll()).resolves.toEqual([
      { id: 'appointment-id' },
    ]);
  });

  it('permite que o cliente detalhe a própria agenda', async () => {
    repository.findById.mockResolvedValue({
      id: 'appointment-id',
      clientId: 'client-id',
    } as never);

    await expect(
      service.findById('appointment-id', 'client-id', UserRole.CLIENT),
    ).resolves.toMatchObject({ id: 'appointment-id' });
  });

  it('oculta do cliente uma agenda pertencente a outra pessoa', async () => {
    repository.findById.mockResolvedValue({
      id: 'appointment-id',
      clientId: 'other-client',
    } as never);

    await expect(
      service.findById('appointment-id', 'client-id', UserRole.CLIENT),
    ).rejects.toThrow('Agendamento não encontrado');
  });

  it('permite que o administrador detalhe qualquer agenda', async () => {
    repository.findById.mockResolvedValue({
      id: 'appointment-id',
      clientId: 'other-client',
    } as never);

    await expect(
      service.findById('appointment-id', 'admin-id', UserRole.ADMIN),
    ).resolves.toMatchObject({ id: 'appointment-id' });
  });

  describe('alterações', () => {
    const appointment = {
      id: 'appointment-id',
      clientId: 'client-id',
      startAt: new Date('2030-08-20T11:00:00.000Z'),
      endAt: new Date('2030-08-20T11:45:00.000Z'),
      status: 'PENDING',
      services: [
        {
          id: 'appointment-service-id',
          serviceId: services[0].id,
          serviceNameSnapshot: 'Corte',
          servicePriceSnapshot: 50,
          serviceDurationSnapshot: 45,
          status: 'PENDING',
        },
      ],
    };

    afterEach(() => jest.useRealTimers());

    it('permite alteração do cliente com exatamente 48 horas', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2030-08-18T11:00:00.000Z'));
      repository.findById.mockResolvedValue(appointment as never);
      repository.updateScheduleIfAvailable.mockResolvedValue({
        ...appointment,
        startAt: new Date('2030-08-21T11:00:00.000Z'),
      } as never);

      await expect(
        service.updateClient('appointment-id', 'client-id', {
          startAt: '2030-08-21T08:00:00-03:00',
        }),
      ).resolves.toMatchObject({ id: 'appointment-id' });
    });

    it('orienta contato por telefone quando faltam menos de 48 horas', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2030-08-18T11:00:01.000Z'));
      repository.findById.mockResolvedValue(appointment as never);

      await expect(
        service.updateClient('appointment-id', 'client-id', {
          startAt: '2030-08-21T08:00:00-03:00',
        }),
      ).rejects.toThrow(
        'Este agendamento não pode mais ser alterado online. Entre em contato por telefone.',
      );
    });

    it('permite que o administrador ignore o prazo de 48 horas', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2030-08-20T10:00:00.000Z'));
      repository.findById.mockResolvedValue(appointment as never);
      repository.updateScheduleIfAvailable.mockResolvedValue(
        appointment as never,
      );

      await expect(
        service.updateAdmin('appointment-id', {
          startAt: '2030-08-21T08:00:00-03:00',
        }),
      ).resolves.toMatchObject({ id: 'appointment-id' });
    });

    it('substitui a lista de serviços e cria snapshots para os novos', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2030-08-18T11:00:00.000Z'));
      repository.findById.mockResolvedValue(appointment as never);
      repository.updateScheduleIfAvailable.mockResolvedValue(
        appointment as never,
      );

      await service.updateClient('appointment-id', 'client-id', {
        serviceIds: [services[1].id],
      });

      expect(
        repository.updateScheduleIfAvailable.mock.calls[0]?.[0],
      ).toMatchObject({
        appointmentId: 'appointment-id',
        startAt: new Date('2030-08-20T11:00:00.000Z'),
        endAt: new Date('2030-08-20T11:30:00.000Z'),
        services: [
          {
            serviceId: services[1].id,
            sequence: 1,
            serviceNameSnapshot: 'Escova',
            serviceDurationSnapshot: 30,
          },
        ],
      });
    });

    it('impede alteração de agenda finalizada', async () => {
      repository.findById.mockResolvedValue({
        ...appointment,
        status: 'COMPLETED',
      } as never);

      await expect(
        service.updateAdmin('appointment-id', {
          startAt: '2030-08-21T08:00:00-03:00',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('cancela a agenda do cliente e seus serviços com 48 horas', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2030-08-18T11:00:00.000Z'));
      repository.findById.mockResolvedValue(appointment as never);
      repository.cancelIfActive.mockResolvedValue({
        ...appointment,
        status: 'CANCELED',
      } as never);

      await expect(
        service.cancelClient('appointment-id', 'client-id'),
      ).resolves.toMatchObject({ status: 'CANCELED' });
    });

    it('exige todos os serviços concluídos antes de concluir a agenda', async () => {
      repository.findById.mockResolvedValue(appointment as never);

      await expect(
        service.updateStatus('appointment-id', AppointmentStatus.COMPLETED),
      ).rejects.toThrow('Todos os serviços devem estar concluídos');
    });

    it('permite confirmar a agenda', async () => {
      repository.findById.mockResolvedValue(appointment as never);
      repository.updateStatus.mockResolvedValue({
        ...appointment,
        status: 'CONFIRMED',
      } as never);

      await expect(
        service.updateStatus('appointment-id', AppointmentStatus.CONFIRMED),
      ).resolves.toMatchObject({ status: 'CONFIRMED' });
    });

    it('impede alterar o status de serviço finalizado', async () => {
      repository.findAppointmentService.mockResolvedValue({
        ...appointment.services[0],
        status: 'COMPLETED',
        appointment,
      } as never);

      await expect(
        service.updateServiceStatus(
          'appointment-id',
          'appointment-service-id',
          AppointmentStatus.CONFIRMED,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
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
