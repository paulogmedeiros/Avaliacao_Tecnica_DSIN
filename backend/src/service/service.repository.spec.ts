import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service.js';
import { ServiceRepository } from './service.repository.js';

describe('ServiceRepository', () => {
  it('consulta somente serviços ativos em ordem alfabética', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      service: { findMany },
    } as unknown as PrismaService;
    const repository = new ServiceRepository(prisma);

    await repository.findActive();

    expect(findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  });
});

