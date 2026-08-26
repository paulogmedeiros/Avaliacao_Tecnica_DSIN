import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponseOptions,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/swagger-response.dto.js';

function errorContent(
  examples: Record<string, { summary: string; value: object }>,
): ApiResponseOptions['content'] {
  return {
    'application/json': {
      schema: { $ref: getSchemaPath(ErrorResponseDto) },
      examples,
    },
  };
}

export function ApiValidationResponse(...messages: string[]) {
  const values = messages.length ? messages : ['Dados inválidos'];
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiBadRequestResponse({
      description:
        'A requisição não atende às regras de validação ou de negócio.',
      content: errorContent({
        validationError: {
          summary: 'Erro de validação',
          value: { statusCode: 400, message: values, error: 'Bad Request' },
        },
      }),
    }),
  );
}

export function ApiAuthenticationResponses(adminOnly = false) {
  const decorators = [
    ApiExtraModels(ErrorResponseDto),
    ApiUnauthorizedResponse({
      description: 'Token JWT ausente, inválido ou expirado.',
      content: errorContent({
        missingToken: {
          summary: 'Não autenticado',
          value: {
            statusCode: 401,
            message: 'Não autorizado',
            error: 'Unauthorized',
          },
        },
      }),
    }),
  ];
  if (adminOnly) {
    decorators.push(
      ApiForbiddenResponse({
        description: 'A operação exige um usuário com perfil ADMIN.',
        content: errorContent({
          insufficientRole: {
            summary: 'Perfil sem permissão',
            value: {
              statusCode: 403,
              message: 'Acesso negado',
              error: 'Forbidden',
            },
          },
        }),
      }),
    );
  }
  return applyDecorators(...decorators);
}

export function ApiResourceNotFound(message: string) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ApiNotFoundResponse({
      description: message,
      content: errorContent({
        notFound: {
          summary: 'Recurso não encontrado',
          value: { statusCode: 404, message, error: 'Not Found' },
        },
      }),
    }),
  );
}
