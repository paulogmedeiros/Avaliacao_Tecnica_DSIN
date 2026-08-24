import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    Length,
    Matches,
} from 'class-validator';
import { UserRole } from '../enum/role.user.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'João da Silva',
        type: String,
    })
    @IsString({
        message: 'O nome deve ser um texto.',
    })
    @IsNotEmpty({
        message: 'O nome é obrigatório.',
    })
    @Length(2, 100, {
        message: 'O nome deve ter entre 2 e 100 caracteres.',
    })
    name!: string;

    @ApiProperty({
        description: 'Endereço de e-mail do usuário',
        example: 'user@example.com',
        type: String,
    })
    @IsEmail(
        {},
        {
            message: 'O email deve ser um endereço de email válido.',
        },
    )
    @Length(1, 100, {
        message: 'O email deve ter entre 1 e 100 caracteres.',
    })
    email!: string;

    @ApiProperty({
        description:
            'Senha forte do usuário (mínimo 8 caracteres, com pelo menos uma letra minúscula, uma maiúscula, um número e um símbolo especial)',
        example: 'StrongPass123!',
        type: String,
    })
    @IsString({
        message: 'A senha deve ser um texto.',
    })
    @Length(6, 255, {
        message: 'A senha deve ter entre 6 e 255 caracteres.',
    })
    password!: string;

    @ApiProperty({
        description: 'Número de telefone do usuário',
        example: '11987654321',
        type: String,
    })
    @IsString({
        message: 'O telefone deve ser um texto.',
    })
    @Matches(/^\d{10,11}$/, {
        message: 'O telefone deve conter 10 ou 11 números.',
    })
    phone!: string;

    @ApiProperty({
        description: 'Perfil do usuário',
        example: 'CLIENT',
        type: String,
    })
    @IsEnum(UserRole, {
        message: 'O perfil deve ser "CLIENT" ou "ADMIN".',
    })
    role!: UserRole;
}
