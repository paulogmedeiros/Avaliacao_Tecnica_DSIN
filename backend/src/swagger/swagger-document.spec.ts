/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppointmentController } from '../appointment/appointment.controller.js';
import { AppointmentService } from '../appointment/appointment.service.js';
import { AuthController } from '../auth/auth.controller.js';
import { AuthService } from '../auth/auth.service.js';
import { ReportController } from '../report/report.controller.js';
import { ReportService } from '../report/report.service.js';
import { ServiceController } from '../service/service.controller.js';
import { ServiceService } from '../service/service.service.js';
import { UserController } from '../user/user.controller.js';
import { UserService } from '../user/user.service.js';

describe('Documentação OpenAPI', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        AuthController,
        UserController,
        ServiceController,
        AppointmentController,
        ReportController,
      ],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: ServiceService, useValue: {} },
        { provide: AppointmentService, useValue: {} },
        { provide: ReportService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('descreve todas as operações com resumo, identificador e respostas', () => {
    const operations = Object.values(document.paths).flatMap((path) =>
      Object.values(path ?? {}).filter(
        (operation) =>
          typeof operation === 'object' &&
          operation !== null &&
          'responses' in operation,
      ),
    );

    expect(operations).toHaveLength(18);
    for (const operation of operations) {
      expect(operation).toEqual(
        expect.objectContaining({
          summary: expect.any(String),
          operationId: expect.any(String),
          responses: expect.objectContaining({
            '400': expect.any(Object),
          }),
        }),
      );
    }
  });

  it('documenta autenticação pública com exemplos de sucesso e erro', () => {
    const login = document.paths['/auth/login']?.post;

    expect(login).toMatchObject({
      summary: 'Autenticar usuário',
      responses: {
        '200': {
          description: expect.any(String),
          content: {
            'application/json': {
              schema: { $ref: expect.stringContaining('LoginResponseDto') },
            },
          },
        },
        '401': {
          content: {
            'application/json': {
              examples: expect.objectContaining({
                invalidCredentials: expect.any(Object),
              }),
            },
          },
        },
      },
    });
    expect(login?.security).toBeUndefined();
  });

  it('diferencia rotas autenticadas das operações exclusivas do administrador', () => {
    expect(document.paths['/service']?.get?.security).toEqual([{ bearer: [] }]);
    expect(document.paths['/service/admin']?.get).toMatchObject({
      description: expect.stringContaining('ADMIN'),
      responses: {
        '403': expect.any(Object),
      },
    });
  });

  it('detalha parâmetros, formatos e exemplos da disponibilidade', () => {
    const availability = document.paths['/appointment/availability']?.get;

    expect(availability?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'date',
          in: 'query',
          required: true,
          schema: expect.objectContaining({ example: '2030-08-20' }),
        }),
        expect.objectContaining({
          name: 'serviceIds',
          in: 'query',
          required: true,
        }),
      ]),
    );
    expect(availability?.responses?.['200']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            $ref: expect.stringContaining('AvailabilityResponseDto'),
          },
        },
      },
    });
  });

  it('documenta os contratos ricos de agendamento e relatório semanal', () => {
    expect(
      document.paths['/appointment/{id}']?.get?.responses?.['200'],
    ).toMatchObject({
      content: {
        'application/json': {
          schema: { $ref: expect.stringContaining('AppointmentResponseDto') },
        },
      },
    });
    expect(
      document.paths['/report/weekly']?.get?.responses?.['200'],
    ).toMatchObject({
      content: {
        'application/json': {
          schema: { $ref: expect.stringContaining('WeeklyReportResponseDto') },
        },
      },
    });
  });
});
