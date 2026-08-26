import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  AppointmentResponseDto,
  AppointmentServiceResponseDto,
  AvailabilityResponseDto,
} from '../dto/swagger-response.dto.js';
import {
  ApiAuthenticationResponses,
  ApiResourceNotFound,
  ApiValidationResponse,
} from './common.swagger.js';

const id = () =>
  ApiParam({ name: 'id', description: 'UUID do agendamento.', format: 'uuid' });
const conflict = () =>
  ApiConflictResponse({
    description:
      'O horário foi ocupado por outro agendamento antes da conclusão da operação.',
    schema: {
      example: {
        statusCode: 409,
        message: 'O horário selecionado não está mais disponível',
        error: 'Conflict',
      },
    },
  });

export function ApiAppointmentAvailability() {
  return applyDecorators(
    ApiOperation({
      summary: 'Consultar horários disponíveis',
      description:
        'Calcula os horários em que todos os serviços selecionados cabem sequencialmente no expediente, desconsiderando almoço, horários passados e conflitos. Também informa a sugestão de data da mesma semana quando aplicável.',
      operationId: 'getAppointmentAvailability',
    }),
    ApiOkResponse({
      description:
        'Duração total, sugestão semanal e intervalos disponíveis em UTC.',
      type: AvailabilityResponseDto,
    }),
    ApiValidationResponse(
      'O salão não funciona nesta data',
      'Um ou mais serviços estão indisponíveis',
    ),
    ApiAuthenticationResponses(),
  );
}

export function ApiAppointmentHistory() {
  return applyDecorators(
    ApiOperation({
      summary: 'Consultar histórico do cliente',
      description:
        'Lista somente os agendamentos pertencentes ao usuário autenticado. startDate e endDate são opcionais e inclusivos no calendário do salão.',
      operationId: 'getClientAppointmentHistory',
    }),
    ApiOkResponse({
      description: 'Histórico do cliente no período informado.',
      type: AppointmentResponseDto,
      isArray: true,
    }),
    ApiValidationResponse('O período informado é inválido'),
    ApiAuthenticationResponses(),
  );
}

export function ApiAdminListAppointments() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todos os agendamentos',
      description:
        'Visão operacional com todos os clientes, serviços e status. Operação exclusiva do perfil ADMIN.',
      operationId: 'listAllAppointments',
    }),
    ApiOkResponse({
      description: 'Todos os agendamentos recebidos pelo salão.',
      type: AppointmentResponseDto,
      isArray: true,
    }),
    ApiValidationResponse(),
    ApiAuthenticationResponses(true),
  );
}

export function ApiAppointmentDetails() {
  return applyDecorators(
    ApiOperation({
      summary: 'Detalhar agendamento',
      description:
        'Retorna os dados completos. Clientes só podem consultar agendamentos próprios; administradores podem consultar qualquer registro.',
      operationId: 'getAppointmentDetails',
    }),
    id(),
    ApiOkResponse({
      description: 'Agendamento com cliente e serviços solicitados.',
      type: AppointmentResponseDto,
    }),
    ApiValidationResponse(),
    ApiResourceNotFound('Agendamento não encontrado'),
    ApiAuthenticationResponses(),
  );
}

export function ApiCreateAppointment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar agendamento',
      description:
        'Agenda um ou mais serviços em sequência. O início deve estar no futuro, conter fuso horário e respeitar intervalos de 30 minutos. O backend recalcula duração e disponibilidade.',
      operationId: 'createAppointment',
    }),
    ApiCreatedResponse({
      description: 'Agendamento criado inicialmente como PENDING.',
      type: AppointmentResponseDto,
    }),
    ApiValidationResponse(
      'O horário deve estar no futuro',
      'O horário inicial deve respeitar intervalos de 30 minutos',
      'O horário não comporta os serviços dentro do expediente',
    ),
    conflict(),
    ApiAuthenticationResponses(),
  );
}

export function ApiClientUpdateAppointment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Alterar agendamento do cliente',
      description:
        'Permite mudar horário e/ou serviços somente ao proprietário e com pelo menos 48 horas exatas de antecedência. Agendamentos concluídos ou cancelados são imutáveis.',
      operationId: 'updateClientAppointment',
    }),
    id(),
    ApiOkResponse({
      description: 'Agendamento atualizado.',
      type: AppointmentResponseDto,
    }),
    ApiValidationResponse(
      'Este agendamento não pode mais ser alterado online. Entre em contato por telefone.',
      'Informe horário ou serviços para alteração',
    ),
    ApiResourceNotFound('Agendamento não encontrado'),
    conflict(),
    ApiAuthenticationResponses(),
  );
}

export function ApiClientCancelAppointment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cancelar agendamento do cliente',
      description:
        'Cancela o agendamento e seus serviços somente com pelo menos 48 horas exatas de antecedência. O registro permanece no histórico.',
      operationId: 'cancelClientAppointment',
    }),
    id(),
    ApiOkResponse({
      description: 'Agendamento e serviços marcados como CANCELED.',
      type: AppointmentResponseDto,
    }),
    ApiValidationResponse(
      'Este agendamento não pode mais ser alterado online. Entre em contato por telefone.',
      'Este agendamento não pode ser cancelado',
    ),
    ApiResourceNotFound('Agendamento não encontrado'),
    ApiAuthenticationResponses(),
  );
}

export function ApiAdminUpdateAppointment() {
  return applyDecorators(
    ApiOperation({
      summary: 'Alterar agendamento como administrador',
      description:
        'Altera horário e/ou serviços sem a restrição de 48 horas, permitindo atender solicitações recebidas por telefone. Exige perfil ADMIN.',
      operationId: 'updateAdminAppointment',
    }),
    id(),
    ApiOkResponse({
      description: 'Agendamento atualizado.',
      type: AppointmentResponseDto,
    }),
    ApiValidationResponse('Informe horário ou serviços para alteração'),
    ApiResourceNotFound('Agendamento não encontrado'),
    conflict(),
    ApiAuthenticationResponses(true),
  );
}

export function ApiAdminUpdateAppointmentStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar status do agendamento',
      description:
        'Confirma, conclui ou cancela um agendamento. Ao cancelar, todos os serviços também são cancelados. COMPLETED só é permitido quando todos os serviços já estão concluídos.',
      operationId: 'updateAppointmentStatus',
    }),
    id(),
    ApiOkResponse({
      description: 'Agendamento com o novo status.',
      type: AppointmentResponseDto,
    }),
    ApiValidationResponse(
      'Todos os serviços devem estar concluídos',
      'O status do agendamento não pode ser alterado',
    ),
    ApiResourceNotFound('Agendamento não encontrado'),
    ApiAuthenticationResponses(true),
  );
}

export function ApiAdminUpdateAppointmentServiceStatus() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar status de um serviço solicitado',
      description:
        'Atualiza individualmente um item do agendamento para PENDING, CONFIRMED, COMPLETED ou CANCELED. Não altera registros de agendas já concluídas ou canceladas.',
      operationId: 'updateAppointmentServiceStatus',
    }),
    ApiParam({
      name: 'appointmentId',
      description: 'UUID do agendamento.',
      format: 'uuid',
    }),
    ApiParam({
      name: 'appointmentServiceId',
      description: 'UUID do item associativo entre agendamento e serviço.',
      format: 'uuid',
    }),
    ApiOkResponse({
      description: 'Item de serviço com o novo status.',
      type: AppointmentServiceResponseDto,
    }),
    ApiValidationResponse('O status deste serviço não pode mais ser alterado'),
    ApiResourceNotFound('Serviço do agendamento não encontrado'),
    ApiAuthenticationResponses(true),
  );
}
