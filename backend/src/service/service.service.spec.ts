import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { jest } from '@jest/globals';
import { ServiceRepository } from './service.repository.js';
import { ServiceService } from './service.service.js';
import { Prisma } from '../generated/prisma/client.js';

describe('ServiceService', () => {
  let repository: jest.Mocked<ServiceRepository>;
  let service: ServiceService;

  beforeEach(() => {
    repository = {
      findActive: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ServiceRepository>;
    service = new ServiceService(repository);
  });

  it('cria o serviço ativo com nome normalizado', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockImplementation(
      (data) =>
        ({
          ...data,
          description: data.description ?? null,
          createdAt: new Date('2026-08-24T12:00:00Z'),
          updatedAt: new Date('2026-08-24T12:00:00Z'),
        }) as never,
    );

    const result = await service.create({
      name: '  Hidratação  ',
      description: 'Profunda',
      price: 55,
      durationMinutes: 45,
    });

    expect(result.name).toBe('Hidratação');
    expect(result.isActive).toBe(true);
  });

  it('rejeita nome duplicado', async () => {
    repository.findByName.mockResolvedValue({ id: 'existing' } as never);
    await expect(
      service.create({ name: 'Hidratação', price: 55, durationMinutes: 45 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('delega a consulta de ativos', async () => {
    repository.findActive.mockResolvedValue([{ name: 'Escova' }] as never);
    await expect(service.findActive()).resolves.toEqual([{ name: 'Escova' }]);
  });

  it('delega a consulta administrativa', async () => {
    repository.findAll.mockResolvedValue([
      { name: 'Escova', isActive: false },
    ] as never);
    await expect(service.findAll()).resolves.toEqual([
      { name: 'Escova', isActive: false },
    ]);
  });

  it('rejeita atualização vazia', async () => {
    await expect(service.update('service-id', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('retorna 404 quando o serviço não existe', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(
      service.update('missing', { isActive: false }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('permite manter o próprio nome', async () => {
    repository.findById.mockResolvedValue({
      id: 'service-id',
      name: 'Escova',
    } as never);
    repository.findByName.mockResolvedValue({
      id: 'service-id',
      name: 'Escova',
    } as never);
    repository.update.mockResolvedValue({
      id: 'service-id',
      name: 'Escova',
    } as never);
    await expect(
      service.update('service-id', { name: ' Escova ' }),
    ).resolves.toMatchObject({
      id: 'service-id',
    });
  });

  it('rejeita o nome pertencente a outro serviço', async () => {
    repository.findById.mockResolvedValue({ id: 'service-id' } as never);
    repository.findByName.mockResolvedValue({ id: 'other-id' } as never);
    await expect(
      service.update('service-id', { name: 'Corte' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('permite remover a descrição', async () => {
    repository.findById.mockResolvedValue({ id: 'service-id' } as never);
    repository.update.mockResolvedValue({
      id: 'service-id',
      description: null,
    } as never);
    await expect(
      service.update('service-id', { description: null }),
    ).resolves.toMatchObject({
      description: null,
    });
    expect(repository.update.mock.calls).toEqual([
      ['service-id', { description: null }],
    ]);
  });

  it('traduz conflito único do banco para ConflictException', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('nome duplicado', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({ name: 'Hidratação', price: 55, durationMinutes: 45 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('propaga erro de banco que não é conflito único', async () => {
    const databaseError = new Error('banco indisponível');
    repository.findByName.mockResolvedValue(null);
    repository.create.mockRejectedValue(databaseError);

    await expect(
      service.create({ name: 'Hidratação', price: 55, durationMinutes: 45 }),
    ).rejects.toBe(databaseError);
  });
});

