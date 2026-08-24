import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserRepository } from './user.repository.js';
import { UserEntity } from './entities/user.entity.js';
import { hashPassword } from '../utils/generate.hashing.js';

@Injectable()
export class UserService {
  constructor(private readonly _userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new BadRequestException('Email já cadastrado');
    }
    const user = new UserEntity(createUserDto);
    user.password = await hashPassword(user.password);
    return await this._userRepository.insert(user);
  }

   async findByEmail(email: string) {
    return await this._userRepository.selectByEmail(email);
  }

}
