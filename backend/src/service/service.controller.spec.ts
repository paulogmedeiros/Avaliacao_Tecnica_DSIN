import { ValidationPipe } from '@nestjs/common';
import { jest } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { ServiceController } from './service.controller.js';
import { ServiceService } from './service.service.js';

describe('Service DTOs', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('aceita os campos válidos de criação', async () => {
    const dto = plainToInstance(CreateServiceDto, {
      name: 'Hidratação',
      description: 'Hidratação profunda',
      price: 55,
      durationMinutes: 45,
    });

    expect(await validate(dto)).toEqual([]);
  });

  it('rejeita isActive no contrato de criação', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        {
          name: 'Hidratação',
          price: 55,
          durationMinutes: 45,
          isActive: false,
        },
        { type: 'body', metatype: CreateServiceDto },
      ),
    ).rejects.toThrow();
  });

  it('rejeita preço e duração no contrato de atualização', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    await expect(
      pipe.transform(
        { price: 60, durationMinutes: 60 },
        { type: 'body', metatype: UpdateServiceDto },
      ),
    ).rejects.toThrow();
  });

  it('aceita remover a descrição com null', async () => {
    const dto = plainToInstance(UpdateServiceDto, { description: null });
    expect(await validate(dto)).toEqual([]);
  });

  it.each([
    [
      'nome de criação',
      CreateServiceDto,
      {
        name: null,
        price: 55,
        durationMinutes: 45,
      },
    ],
    [
      'descrição de criação',
      CreateServiceDto,
      {
        name: 'Hidratação',
        description: null,
        price: 55,
        durationMinutes: 45,
      },
    ],
    ['nome de atualização', UpdateServiceDto, { name: null }],
    ['situação de atualização', UpdateServiceDto, { isActive: null }],
  ])('rejeita null no %s', async (_field, metatype, value) => {
    await expect(
      pipe.transform(value, { type: 'body', metatype }),
    ).rejects.toThrow();
  });

  it.each([
    [
      'criação',
      CreateServiceDto,
      {
        name: ' A ',
        price: 55,
        durationMinutes: 45,
      },
    ],
    ['atualização', UpdateServiceDto, { name: '   ' }],
  ])(
    'valida o comprimento do nome já normalizado na %s',
    async (_operation, metatype, value) => {
      await expect(
        pipe.transform(value, { type: 'body', metatype }),
      ).rejects.toThrow();
    },
  );
});

describe('ServiceController', () => {
  const service = {
    findActive: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<ServiceService>;
  const controller = new ServiceController(service);

  it('retorna somente a consulta de ativos na rota comum', async () => {
    service.findActive.mockResolvedValue([
      { name: 'Escova', isActive: true },
    ] as never);

    await expect(controller.findActive()).resolves.toEqual([
      { name: 'Escova', isActive: true },
    ]);
  });

  it('retorna a consulta completa na rota administrativa', async () => {
    service.findAll.mockResolvedValue([
      { name: 'Escova', isActive: false },
    ] as never);

    await expect(controller.findAll()).resolves.toEqual([
      { name: 'Escova', isActive: false },
    ]);
  });

  it.each(['findAll', 'create', 'update'] as const)(
    'exige ADMIN em %s',
    (methodName) => {
      const method: object = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(controller),
        methodName,
      )?.value as object;
      expect(Reflect.getMetadata(ROLES_KEY, method)).toEqual([UserRole.ADMIN]);
    },
  );
});

