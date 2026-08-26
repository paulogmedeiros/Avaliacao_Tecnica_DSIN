import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { LoginResponseDto } from '../../auth/dto/login.response.dto.js';
import { ErrorResponseDto } from '../dto/swagger-response.dto.js';
import { ApiValidationResponse } from './common.swagger.js';

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Autenticar usuário',
      description:
        'Valida e-mail e senha e devolve um token JWT. O token contém o identificador, nome e perfil do usuário e deve ser enviado como Bearer Token nas rotas protegidas.',
      operationId: 'login',
    }),
    ApiExtraModels(ErrorResponseDto),
    ApiOkResponse({
      description: 'Login realizado com sucesso.',
      type: LoginResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'E-mail ou senha inválidos.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ErrorResponseDto) },
          examples: {
            invalidCredentials: {
              summary: 'Credenciais inválidas',
              value: {
                statusCode: 401,
                message: 'Email ou senha inválidos',
                error: 'Unauthorized',
              },
            },
          },
        },
      },
    }),
    ApiValidationResponse(
      'email deve ser um endereço de e-mail válido',
      'A senha é obrigatória',
    ),
  );
}
