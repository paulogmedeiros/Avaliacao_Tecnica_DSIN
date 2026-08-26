import { generateId } from '../../utils/generate.uuidv7.js';
import { CreateServiceDto } from '../dto/create-service.dto.js';

export class ServiceEntity {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;

  constructor(data: CreateServiceDto) {
    this.id = generateId();
    this.name = data.name.trim();
    this.description = data.description?.trim();
    this.price = data.price;
    this.durationMinutes = data.durationMinutes;
    this.isActive = true;
  }
}
