import { ValidationPipe } from '@nestjs/common';
import { jest } from '@jest/globals';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js';
import { HistoryQueryDto } from './dto/history-query.dto.js';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { AppointmentController } from './appointment.controller.js';
import { AppointmentService } from './appointment.service.js';

describe('Appointment DTOs', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('transforma os IDs separados por vírgula na consulta', async () => {
    const dto = (await pipe.transform(
      {
        date: '2030-08-20',
        serviceIds:
          '0198d000-0000-7000-8000-000000000001,0198d000-0000-7000-8000-000000000002',
      },
      { type: 'query', metatype: AvailabilityQueryDto },
    )) as AvailabilityQueryDto;

    expect(dto.serviceIds).toHaveLength(2);
  });

  it('rejeita criação sem serviços', async () => {
    await expect(
      pipe.transform(
        { startAt: '2030-08-20T08:30:00-03:00', serviceIds: [] },
        { type: 'body', metatype: CreateAppointmentDto },
      ),
    ).rejects.toThrow();
  });
});

describe('AppointmentController', () => {
  const service = {
    findAvailability: jest.fn(),
    findHistory: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<AppointmentService>;
  const controller = new AppointmentController(service);

  it('usa o usuário autenticado como cliente ao criar', async () => {
    service.create.mockResolvedValue({ id: 'appointment-id' } as never);

    await controller.create({ user: { sub: 'client-id' } } as never, {
      startAt: '2030-08-20T08:30:00-03:00',
      serviceIds: ['0198d000-0000-7000-8000-000000000001'],
    });

    expect(service.create.mock.calls[0]?.[0]).toBe('client-id');
  });

  it('usa o usuário autenticado ao consultar disponibilidade', async () => {
    service.findAvailability.mockResolvedValue({ slots: [] } as never);

    await controller.findAvailability({ user: { sub: 'client-id' } } as never, {
      date: '2030-08-20',
      serviceIds: ['0198d000-0000-7000-8000-000000000001'],
    });

    expect(service.findAvailability.mock.calls[0]?.[0]).toBe('client-id');
  });

  it('usa o usuário autenticado ao consultar o histórico', async () => {
    service.findHistory.mockResolvedValue([] as never);

    await controller.findHistory(
      { user: { sub: 'client-id', role: UserRole.CLIENT } } as never,
      { startDate: '2030-08-20' },
    );

    expect(service.findHistory.mock.calls[0]).toEqual([
      'client-id',
      { startDate: '2030-08-20' },
    ]);
  });

  it('exige ADMIN para listar todas as agendas', () => {
    const method = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(controller),
      'findAll',
    )?.value as object;
    expect(Reflect.getMetadata(ROLES_KEY, method)).toEqual([UserRole.ADMIN]);
  });

  it('envia identidade e perfil ao detalhar uma agenda', async () => {
    service.findById.mockResolvedValue({ id: 'appointment-id' } as never);

    await controller.findById('appointment-id', {
      user: { sub: 'client-id', role: UserRole.CLIENT },
    } as never);

    expect(service.findById.mock.calls[0]).toEqual([
      'appointment-id',
      'client-id',
      UserRole.CLIENT,
    ]);
  });
});

describe('HistoryQueryDto', () => {
  const pipe = new ValidationPipe({ transform: true });

  it('aceita um período no formato esperado', async () => {
    await expect(
      pipe.transform(
        { startDate: '2030-08-01', endDate: '2030-08-31' },
        { type: 'query', metatype: HistoryQueryDto },
      ),
    ).resolves.toMatchObject({ startDate: '2030-08-01' });
  });

  it('rejeita data em formato brasileiro', async () => {
    await expect(
      pipe.transform(
        { startDate: '01/08/2030' },
        { type: 'query', metatype: HistoryQueryDto },
      ),
    ).rejects.toThrow();
  });
});
