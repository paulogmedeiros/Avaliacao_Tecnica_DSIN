import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServiceEntity } from './entities/service.entity.js';
import { ServiceRepository } from './service.repository.js';

@Injectable()
export class ServiceService {
  constructor(private readonly repository: ServiceRepository) { }

  async create(dto: CreateServiceDto) {
    const entity = new ServiceEntity(dto);
    const serviceNameExists = await this.repository.findByName(entity.name);
    if (serviceNameExists) {
      throw new ConflictException('Serviço já cadastrado');
    }
    return await this.repository.create(entity);
  }

  async findActive() {
    return await this.repository.findActive();
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async update(id: string, dto: UpdateServiceDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Informe ao menos um campo para atualização',
      );
    }
    const service = await this.repository.findById(id)
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    const data = {
      ...dto,
      ...(dto.name === undefined ? {} : { name: dto.name.trim() }),
    };

    if (data.name) {
      const sameName = await this.repository.findByName(data.name);
      if (sameName && sameName.id !== id) {
        throw new ConflictException('Serviço já cadastrado');
      }
    }
    return await this.repository.update(id, data);
  }
}

