import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTags } from './swagger.tags.js';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Leila — API do Salão')
    .setDescription(
      'API para autenticação, catálogo de serviços, agendamentos de clientes e acompanhamento semanal do salão. Datas e horas dos contratos são transmitidas em ISO 8601; instantes são persistidos e retornados em UTC.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Cole somente o token JWT retornado por POST /auth/login.',
      },
      'bearer',
    )
    .addTag(SwaggerTags.AUTH, 'Login e emissão do token JWT.')
    .addTag(
      SwaggerTags.USER,
      'Cadastro público de clientes e rota administrativa legada.',
    )
    .addTag(
      SwaggerTags.SERVICE,
      'Catálogo de serviços ativos e manutenção administrativa.',
    )
    .addTag(
      SwaggerTags.APPOINTMENT,
      'Disponibilidade, criação, histórico e gestão operacional das agendas.',
    )
    .addTag(
      SwaggerTags.REPORT,
      'Indicadores semanais disponíveis ao administrador.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Leila | Documentação da API',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
