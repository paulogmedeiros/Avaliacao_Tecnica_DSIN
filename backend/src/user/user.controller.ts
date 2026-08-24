import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';
import { UserRole } from './enum/role.user.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateClientUserDto } from './dto/create-client-user.dto.js';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Post()
  async createClientUser(@Body() createClientUserDto: CreateClientUserDto) {
    return await this.userService.create({
      ...createClientUserDto,
      role: UserRole.CLIENT,
    });
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('admin')
  async createAdminUser(@Body() createClientUserDto: CreateClientUserDto) {
    return await this.userService.create({
      ...createClientUserDto,
      role: UserRole.ADMIN,
    });
  }
}
