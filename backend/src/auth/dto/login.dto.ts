import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity.js';


export class LoginDto {
    @ApiProperty({
        description: 'Endereço de e-mail do usuário',
        example: 'user@example.com',
        type: String,
    })
    @IsEmail()
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    email!: UserEntity['email'];

    @ApiProperty({
        description: 'Senha do usuário',
        example: 'StrongPass123!',
        type: String,
    })
    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória' })
    password!: UserEntity['password'];
}
