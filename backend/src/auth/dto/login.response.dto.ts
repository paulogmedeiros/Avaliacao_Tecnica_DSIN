import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'jwt.token.aqui',
  })
  access_token!: string;
}
