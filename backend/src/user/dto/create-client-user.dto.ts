import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

export class CreateClientUserDto extends OmitType(CreateUserDto, [
  'role',
] as const) {}
