import { ValidationPipe } from '@nestjs/common';
import { jest } from '@jest/globals';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../user/enum/role.user.js';
import { WeeklyReportQueryDto } from './dto/weekly-report-query.dto.js';
import { ReportController } from './report.controller.js';
import { ReportService } from './report.service.js';

describe('ReportController', () => {
  const service = {
    getWeekly: jest.fn(),
  } as unknown as jest.Mocked<ReportService>;
  const controller = new ReportController(service);

  it('exige perfil ADMIN no relatório semanal', () => {
    const method = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(controller),
      'weekly',
    )?.value as object;

    expect(Reflect.getMetadata(ROLES_KEY, method)).toEqual([UserRole.ADMIN]);
  });

  it('encaminha a data consultada ao serviço', async () => {
    service.getWeekly.mockResolvedValue({ period: {} } as never);

    await controller.weekly({ date: '2030-08-20' });

    expect(service.getWeekly.mock.calls[0]).toEqual(['2030-08-20']);
  });
});

describe('WeeklyReportQueryDto', () => {
  const pipe = new ValidationPipe({ transform: true });

  it('aceita data no formato ISO', async () => {
    await expect(
      pipe.transform(
        { date: '2030-08-20' },
        { type: 'query', metatype: WeeklyReportQueryDto },
      ),
    ).resolves.toBeInstanceOf(WeeklyReportQueryDto);
  });

  it('rejeita data em formato brasileiro', async () => {
    await expect(
      pipe.transform(
        { date: '20/08/2030' },
        { type: 'query', metatype: WeeklyReportQueryDto },
      ),
    ).rejects.toThrow();
  });
});
