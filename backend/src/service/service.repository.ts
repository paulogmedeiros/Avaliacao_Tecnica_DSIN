import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServiceEntity } from './entities/service.entity.js';

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    return await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    return await this.prisma.service.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    return await this.prisma.service.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return await this.prisma.service.findUnique({ where: { name } });
  }

  async create(data: ServiceEntity) {
    return await this.prisma.service.create({ data });
  }

  async update(id: string, data: UpdateServiceDto) {
    return await this.prisma.service.update({ where: { id }, data });
  }
}
