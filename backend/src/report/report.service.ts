import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentStatus } from '../generated/prisma/client.js';
import {
  getSalonDate,
  getSalonWeekRange,
} from '../appointment/appointment-time.util.js';
import { ReportRepository } from './report.repository.js';

type Appointments = Awaited<
  ReturnType<ReportRepository['findAppointmentsInRange']>
>;
type BusinessHours = Awaited<ReturnType<ReportRepository['findBusinessHours']>>;

const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class ReportService {
  constructor(private readonly repository: ReportRepository) {}

  async getWeekly(date: string) {
    assertValidDate(date);
    const currentRange = getSalonWeekRange(date);
    const previousRange = {
      start: new Date(currentRange.start.getTime() - WEEK_IN_MILLISECONDS),
      end: new Date(currentRange.end.getTime() - WEEK_IN_MILLISECONDS),
    };
    const [current, previous, businessHours] = await Promise.all([
      this.repository.findAppointmentsInRange(
        currentRange.start,
        currentRange.end,
      ),
      this.repository.findAppointmentsInRange(
        previousRange.start,
        previousRange.end,
      ),
      this.repository.findBusinessHours(),
    ]);
    const availableMinutes = calculateAvailableMinutes(businessHours);
    const currentMetrics = calculateMetrics(
      current,
      currentRange.start,
      currentRange.end,
      availableMinutes,
    );
    const previousMetrics = calculateMetrics(
      previous,
      previousRange.start,
      previousRange.end,
      availableMinutes,
    );

    return {
      period: {
        startDate: getSalonDate(currentRange.start),
        endDate: getSalonDate(new Date(currentRange.end.getTime() - 1)),
      },
      appointments: currentMetrics.appointments,
      revenue: currentMetrics.revenue,
      services: currentMetrics.services,
      occupancy: currentMetrics.occupancy,
      clients: currentMetrics.clients,
      topServices: currentMetrics.topServices,
      comparison: {
        appointmentsChangePercentage: percentageChange(
          currentMetrics.appointments.total,
          previousMetrics.appointments.total,
        ),
        completedRevenueChangePercentage: percentageChange(
          currentMetrics.completedRevenue,
          previousMetrics.completedRevenue,
        ),
        occupancyChangePercentage: percentageChange(
          currentMetrics.rawOccupancyRate,
          previousMetrics.rawOccupancyRate,
        ),
        cancellationRateChange: round(
          currentMetrics.appointments.cancellationRate -
            previousMetrics.appointments.cancellationRate,
        ),
      },
    };
  }
}

function calculateMetrics(
  appointments: Appointments,
  rangeStart: Date,
  rangeEnd: Date,
  availableMinutes: number,
) {
  const appointmentCounts = countStatuses(appointments);
  const appointmentTotal = appointments.length;
  const services = appointments.flatMap((appointment) => appointment.services);
  const serviceCounts = countStatuses(services);
  const completedRevenue = sumServicePrices(
    services,
    AppointmentStatus.COMPLETED,
  );
  const expectedRevenue = services
    .filter(
      (service) =>
        service.status === AppointmentStatus.PENDING ||
        service.status === AppointmentStatus.CONFIRMED,
    )
    .reduce(
      (total, service) => total + Number(service.servicePriceSnapshot),
      0,
    );
  const lostRevenue = sumServicePrices(services, AppointmentStatus.CANCELED);
  const activeAppointments = appointments.filter(
    (appointment) => appointment.status !== AppointmentStatus.CANCELED,
  );
  const scheduledMinutes = activeAppointments.reduce(
    (total, appointment) =>
      total +
      (appointment.endAt.getTime() - appointment.startAt.getTime()) / 60000,
    0,
  );
  const completedMinutes = services
    .filter((service) => service.status === AppointmentStatus.COMPLETED)
    .reduce((total, service) => total + service.serviceDurationSnapshot, 0);
  const rawOccupancyRate = availableMinutes
    ? (scheduledMinutes / availableMinutes) * 100
    : 0;
  const activeClientIds = new Set(
    activeAppointments.map((appointment) => appointment.clientId),
  );
  const completedClientIds = new Set(
    appointments
      .filter(
        (appointment) => appointment.status === AppointmentStatus.COMPLETED,
      )
      .map((appointment) => appointment.clientId),
  );
  const newClientIds = new Set(
    activeAppointments
      .filter(
        (appointment) =>
          appointment.client.createdAt >= rangeStart &&
          appointment.client.createdAt < rangeEnd,
      )
      .map((appointment) => appointment.clientId),
  );

  return {
    appointments: {
      total: appointmentTotal,
      ...appointmentCounts,
      cancellationRate: appointmentTotal
        ? round((appointmentCounts.canceled / appointmentTotal) * 100)
        : 0,
    },
    revenue: {
      completed: money(completedRevenue),
      expected: money(expectedRevenue),
      lostByCancellation: money(lostRevenue),
    },
    services: { total: services.length, ...serviceCounts },
    occupancy: {
      availableMinutes,
      scheduledMinutes,
      completedMinutes,
      occupancyRate: round(rawOccupancyRate),
    },
    clients: {
      uniqueScheduled: activeClientIds.size,
      uniqueCompleted: completedClientIds.size,
      newClients: newClientIds.size,
    },
    topServices: groupTopServices(services),
    completedRevenue,
    rawOccupancyRate,
  };
}

function countStatuses(items: Array<{ status: AppointmentStatus }>) {
  return {
    pending: items.filter((item) => item.status === AppointmentStatus.PENDING)
      .length,
    confirmed: items.filter(
      (item) => item.status === AppointmentStatus.CONFIRMED,
    ).length,
    completed: items.filter(
      (item) => item.status === AppointmentStatus.COMPLETED,
    ).length,
    canceled: items.filter((item) => item.status === AppointmentStatus.CANCELED)
      .length,
  };
}

function sumServicePrices(
  services: Appointments[number]['services'],
  status: AppointmentStatus,
) {
  return services
    .filter((service) => service.status === status)
    .reduce(
      (total, service) => total + Number(service.servicePriceSnapshot),
      0,
    );
}

function groupTopServices(services: Appointments[number]['services']) {
  const grouped = new Map<
    string,
    {
      serviceId: string;
      name: string;
      quantity: number;
      completedQuantity: number;
      completedRevenue: number;
    }
  >();
  for (const service of services) {
    const current = grouped.get(service.serviceId) ?? {
      serviceId: service.serviceId,
      name: service.serviceNameSnapshot,
      quantity: 0,
      completedQuantity: 0,
      completedRevenue: 0,
    };
    current.quantity += 1;
    if (service.status === AppointmentStatus.COMPLETED) {
      current.completedQuantity += 1;
      current.completedRevenue += Number(service.servicePriceSnapshot);
    }
    grouped.set(service.serviceId, current);
  }

  return [...grouped.values()]
    .sort((first, second) =>
      second.quantity !== first.quantity
        ? second.quantity - first.quantity
        : first.name.localeCompare(second.name),
    )
    .slice(0, 5)
    .map((service) => ({
      ...service,
      completedRevenue: money(service.completedRevenue),
    }));
}

function calculateAvailableMinutes(businessHours: BusinessHours) {
  return businessHours.reduce(
    (total, businessHour) =>
      total +
      minutesBetween(businessHour.openingTime, businessHour.lunchStart) +
      minutesBetween(businessHour.lunchEnd, businessHour.closingTime),
    0,
  );
}

function minutesBetween(start: Date, end: Date) {
  const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
  const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
  return endMinutes - startMinutes;
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return round(((current - previous) / previous) * 100);
}

function money(value: number) {
  return value.toFixed(2);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function assertValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('A data informada é inválida');
  }
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new BadRequestException('A data informada é inválida');
  }
}
