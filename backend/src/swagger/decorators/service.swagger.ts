import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ServiceResponseDto } from '../dto/swagger-response.dto.js';
import {
  ApiAuthenticationResponses,
  ApiResourceNotFound,
  ApiValidationResponse,
} from './common.swagger.js';

export function ApiListActiveServices() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar serviços ativos',
      description:
        'Retorna o catálogo disponível para agendamento. Exige autenticação, mas aceita clientes e administradores.',
      operationId: 'listActiveServices',
    }),
    ApiOkResponse({
      description: 'Serviços ativos ordenados pelo catálogo.',
      type: ServiceResponseDto,
      isArray: true,
    }),
    ApiValidationResponse(),
    ApiAuthenticationResponses(),
  );
}
export function ApiListAllServices() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todos os serviços',
      description:
        'Retorna serviços ativos e inativos. Operação exclusiva do perfil ADMIN.',
      operationId: 'listAllServices',
    }),
    ApiOkResponse({
      description: 'Catálogo administrativo completo.',
      type: ServiceResponseDto,
      isArray: true,
    }),
    ApiValidationResponse(),
    ApiAuthenticationResponses(true),
  );
}
export function ApiCreateService() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar serviço',
      description:
        'Inclui um serviço ativo no catálogo. Nome deve ser único; preço e duração são definidos somente na criação.',
      operationId: 'createService',
    }),
    ApiCreatedResponse({
      description: 'Serviço cadastrado com sucesso.',
      type: ServiceResponseDto,
    }),
    ApiValidationResponse('Serviço já cadastrado'),
    ApiAuthenticationResponses(true),
  );
}
export function ApiUpdateService() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar serviço',
      description:
        'Altera nome, descrição e/ou situação ativa do serviço. O histórico de agendamentos preserva os dados originais em snapshots.',
      operationId: 'updateService',
    }),
    ApiParam({ name: 'id', description: 'UUID do serviço.', format: 'uuid' }),
    ApiOkResponse({
      description: 'Serviço atualizado com sucesso.',
      type: ServiceResponseDto,
    }),
    ApiValidationResponse(
      'Informe ao menos um campo para atualização',
      'Serviço já cadastrado',
    ),
    ApiResourceNotFound('Serviço não encontrado'),
    ApiAuthenticationResponses(true),
  );
}
