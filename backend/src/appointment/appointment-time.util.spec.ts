import { getSalonDate, salonDateTimeToUtc } from './appointment-time.util.js';

describe('Appointment time utilities', () => {
  it('converte o horário do salão sempre com UTC-3', () => {
    expect(salonDateTimeToUtc('2018-11-05', 8, 0)).toEqual(
      new Date('2018-11-05T11:00:00.000Z'),
    );
    expect(salonDateTimeToUtc('2030-08-20', 8, 0)).toEqual(
      new Date('2030-08-20T11:00:00.000Z'),
    );
  });

  it('obtém a data civil de São Paulo a partir de um instante UTC', () => {
    expect(getSalonDate(new Date('2030-08-21T01:30:00.000Z'))).toBe(
      '2030-08-20',
    );
  });
});
