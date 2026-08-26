import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';
import { UserRole } from './enum/role.user.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateClientUserDto } from './dto/create-client-user.dto.js';
import {
  ApiCreateAdminLegacy,
  ApiCreateClient,
} from '../swagger/decorators/user.swagger.js';
import { SwaggerTags } from '../swagger/swagger.tags.js';

@ApiTags(SwaggerTags.USER)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @ApiCreateClient()
  @Post()
  async createClientUser(@Body() createClientUserDto: CreateClientUserDto) {
    return await this.userService.create({
      ...createClientUserDto,
      role: UserRole.CLIENT,
    });
  }

  @ApiBearerAuth()
  @ApiCreateAdminLegacy()
  @Roles(UserRole.ADMIN)
  @Post('admin')
  async createAdminUser(@Body() createClientUserDto: CreateClientUserDto) {
    return await this.userService.create({
      ...createClientUserDto,
      role: UserRole.ADMIN,
    });
  }
}
