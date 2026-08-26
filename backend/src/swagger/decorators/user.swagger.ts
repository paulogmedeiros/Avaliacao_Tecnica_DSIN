import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/swagger-response.dto.js';
import {
  ApiAuthenticationResponses,
  ApiValidationResponse,
} from './common.swagger.js';

export function ApiCreateClient() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar cliente',
      description:
        'Cria uma conta pública com perfil CLIENT. O campo role não é aceito pelo cadastro público.',
      operationId: 'createClient',
    }),
    ApiCreatedResponse({
      description: 'Cliente cadastrado com sucesso.',
      type: UserResponseDto,
    }),
    ApiValidationResponse(
      'Email já cadastrado',
      'A senha deve atender aos critérios de segurança',
    ),
  );
}

export function ApiCreateAdminLegacy() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar administrador (legado)',
      description:
        'Rota administrativa mantida por compatibilidade, mas fora dos requisitos funcionais atuais. Exige perfil ADMIN.',
      operationId: 'createAdmin',
      deprecated: true,
    }),
    ApiCreatedResponse({
      description: 'Administrador cadastrado com sucesso.',
      type: UserResponseDto,
    }),
    ApiValidationResponse('Email já cadastrado'),
    ApiAuthenticationResponses(true),
  );
}
