const SALON_UTC_OFFSET_HOURS = -3;

interface SalonDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getSalonDateTimeParts(value: Date): SalonDateTimeParts {
  const local = new Date(
    value.getTime() + SALON_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  );

  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
    hour: local.getUTCHours(),
    minute: local.getUTCMinutes(),
    second: local.getUTCSeconds(),
  };
}

export function getSalonDate(value: Date): string {
  const parts = getSalonDateTimeParts(value);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function salonDateTimeToUtc(
  date: string,
  hour: number,
  minute: number,
): Date {
  return new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
      hour - SALON_UTC_OFFSET_HOURS,
      minute,
    ),
  );
}

export function getSalonWeekRange(date: string) {
  const calendarDate = new Date(`${date}T12:00:00.000Z`);
  const daysSinceMonday = (calendarDate.getUTCDay() + 6) % 7;
  const monday = addDays(date, -daysSinceMonday);
  const nextMonday = addDays(monday, 7);

  return {
    start: salonDateTimeToUtc(monday, 0, 0),
    end: salonDateTimeToUtc(nextMonday, 0, 0),
  };
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}
