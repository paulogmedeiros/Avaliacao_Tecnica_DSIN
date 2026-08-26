import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServiceService } from './service.service.js';
import {
  ApiCreateService,
  ApiListActiveServices,
  ApiListAllServices,
  ApiUpdateService,
} from '../swagger/decorators/service.swagger.js';
import { SwaggerTags } from '../swagger/swagger.tags.js';

@ApiBearerAuth()
@ApiTags(SwaggerTags.SERVICE)
@Controller('service')
export class ServiceController {
  constructor(private readonly service: ServiceService) {}

  @Get()
  @ApiListActiveServices()
  async findActive() {
    return await this.service.findActive();
  }

  @Roles(UserRole.ADMIN)
  @Get('admin')
  @ApiListAllServices()
  async findAll() {
    return await this.service.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @ApiCreateService()
  async create(@Body() dto: CreateServiceDto) {
    return await this.service.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiUpdateService()
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return await this.service.update(id, dto);
  }
}
