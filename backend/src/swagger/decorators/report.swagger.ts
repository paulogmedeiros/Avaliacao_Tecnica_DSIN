import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { WeeklyReportResponseDto } from '../dto/swagger-response.dto.js';
import {
  ApiAuthenticationResponses,
  ApiValidationResponse,
} from './common.swagger.js';

export function ApiWeeklyReport() {
  return applyDecorators(
    ApiOperation({
      summary: 'Consultar desempenho semanal',
      description:
        'Calcula indicadores da semana de segunda a sábado que contém a data informada e compara os resultados com a semana anterior. Valores monetários são strings com duas casas decimais.',
      operationId: 'getWeeklyReport',
    }),
    ApiOkResponse({
      description:
        'Indicadores semanais, ranking de serviços e comparação com a semana anterior.',
      type: WeeklyReportResponseDto,
    }),
    ApiValidationResponse('A data informada é inválida'),
    ApiAuthenticationResponses(true),
  );
}
