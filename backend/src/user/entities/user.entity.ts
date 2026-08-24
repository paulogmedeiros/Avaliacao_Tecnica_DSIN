import { generateId } from '../../utils/generate.uuidv7.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UserRole } from '../enum/role.user.js';

export class UserEntity {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;

  constructor(user: CreateUserDto) {
    this.id = generateId();
    this.email = user.email;
    this.password = user.password;
    this.name = this.nomalizeName(user.name);
    this.phone = user.phone;
    this.role = user.role;
  }

  private nomalizeName(name: CreateUserDto['name']): string {
    return name.trim();
  }
}
