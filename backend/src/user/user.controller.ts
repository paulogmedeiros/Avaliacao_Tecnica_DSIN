import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';
import { UserRole } from './enum/role.user.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  async createClientUser(@Body() createUserDto: CreateUserDto) {
    createUserDto.role = UserRole.CLIENT;
    return await this.userService.create(createUserDto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('admin')
  async createAdminUser(@Body() createUserDto: CreateUserDto) {
    createUserDto.role = UserRole.ADMIN;
    return await this.userService.create(createUserDto);
  }
}
