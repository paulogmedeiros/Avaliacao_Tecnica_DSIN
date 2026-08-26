import { buildMariaDbConfig } from './prisma-connection.util.js';

describe('buildMariaDbConfig', () => {
  it('habilita a recuperação da chave pública exigida pelo MySQL', () => {
    expect(
      buildMariaDbConfig('mysql://user:pass@localhost:3306/leila'),
    ).toMatchObject({
      host: 'localhost',
      port: 3306,
      user: 'user',
      password: 'pass',
      database: 'leila',
      timezone: 'UTC',
      allowPublicKeyRetrieval: true,
    });
  });
});
