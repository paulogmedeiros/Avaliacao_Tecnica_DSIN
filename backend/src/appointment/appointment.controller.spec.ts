import { ValidationPipe } from '@nestjs/common';
import { jest } from '@jest/globals';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js';
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
});
