import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DayOfWeek, Prisma } from '../generated/prisma/client.js';
import { generateId } from '../utils/generate.uuidv7.js';
import { UserRole } from '../user/enum/role.user.js';
import { AppointmentRepository } from './appointment.repository.js';
import {
  getSalonDate,
  getSalonDateTimeParts,
  getSalonWeekRange,
  salonDateTimeToUtc,
} from './appointment-time.util.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { HistoryQueryDto } from './dto/history-query.dto.js';

const SLOT_INTERVAL_MINUTES = 30;
const DAY_BY_NUMBER: Partial<Record<number, DayOfWeek>> = {
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

interface SelectedService {
  id: string;
  name: string;
  price: Prisma.Decimal;
  durationMinutes: number;
}

@Injectable()
export class AppointmentService {
  constructor(private readonly repository: AppointmentRepository) {}

  async findAvailability(clientId: string, date: string, serviceIds: string[]) {
    this.assertValidDate(date);
    const dayOfWeek = this.getDayOfWeek(date);
    const selectedServices = await this.getSelectedServices(serviceIds);
    const businessHour = await this.repository.findBusinessHour(dayOfWeek);

    if (!businessHour) {
      throw new BadRequestException('O salão não funciona nesta data');
    }

    const durationMinutes = selectedServices.reduce(
      (total, service) => total + service.durationMinutes,
      0,
    );
    const periods = this.getPeriods(date, businessHour);
    const dayStart = this.toInstant(date, 0, 0);
    const dayEnd = this.addMinutes(dayStart, 24 * 60);
    const appointments = await this.repository.findAppointmentsBetween(
      dayStart,
      dayEnd,
    );
    const now = new Date();
    const week = getSalonWeekRange(date);
    const existingAppointment =
      await this.repository.findFirstUpcomingByClientInRange(
        clientId,
        week.start,
        week.end,
        now,
      );
    const slots: Array<{ startAt: Date; endAt: Date }> = [];

    for (const period of periods) {
      for (
        let startAt = period.start;
        this.addMinutes(startAt, durationMinutes) <= period.end;
        startAt = this.addMinutes(startAt, SLOT_INTERVAL_MINUTES)
      ) {
        const endAt = this.addMinutes(startAt, durationMinutes);
        const overlaps = appointments.some(
          (appointment) =>
            appointment.startAt < endAt && appointment.endAt > startAt,
        );
        if (startAt >= now && !overlaps) slots.push({ startAt, endAt });
      }
    }

    const suggestedDate = existingAppointment
      ? getSalonDate(existingAppointment.startAt)
      : null;
    const suggestion =
      existingAppointment && suggestedDate !== null && suggestedDate !== date
        ? {
            date: suggestedDate,
            appointmentId: existingAppointment.id,
            message: `Você já possui um agendamento nesta semana. Deseja marcar os novos serviços para ${this.formatDate(suggestedDate)}?`,
          }
        : null;

    return { date, durationMinutes, suggestion, slots };
  }

  async create(clientId: string, dto: CreateAppointmentDto) {
    const startAt = new Date(dto.startAt);
    if (Number.isNaN(startAt.getTime()) || startAt <= new Date()) {
      throw new BadRequestException('O horário deve estar no futuro');
    }

    const local = getSalonDateTimeParts(startAt);
    if (
      local.second !== 0 ||
      startAt.getUTCMilliseconds() !== 0 ||
      local.minute % 30 !== 0
    ) {
      throw new BadRequestException(
        'O horário inicial deve respeitar intervalos de 30 minutos',
      );
    }

    const date = `${local.year}-${this.pad(local.month)}-${this.pad(local.day)}`;
    const dayOfWeek = this.getDayOfWeek(date);
    const selectedServices = await this.getSelectedServices(dto.serviceIds);
    const businessHour = await this.repository.findBusinessHour(dayOfWeek);
    if (!businessHour) {
      throw new BadRequestException('O salão não funciona nesta data');
    }

    const durationMinutes = selectedServices.reduce(
      (total, service) => total + service.durationMinutes,
      0,
    );
    const endAt = this.addMinutes(startAt, durationMinutes);
    const fitsBusinessHours = this.getPeriods(date, businessHour).some(
      (period) => startAt >= period.start && endAt <= period.end,
    );
    if (!fitsBusinessHours) {
      throw new BadRequestException(
        'O horário não comporta os serviços dentro do expediente',
      );
    }

    const result = await this.repository.createIfAvailable({
      id: generateId(),
      clientId,
      startAt,
      endAt,
      services: selectedServices.map((service, index) => ({
        id: generateId(),
        serviceId: service.id,
        sequence: index + 1,
        serviceNameSnapshot: service.name,
        servicePriceSnapshot: service.price,
        serviceDurationSnapshot: service.durationMinutes,
      })),
    });

    if (!result) {
      throw new ConflictException(
        'O horário selecionado não está mais disponível',
      );
    }
    return result;
  }

  async findHistory(clientId: string, query: HistoryQueryDto) {
    const { startAt, endAt } = this.getHistoryPeriod(query);
    if (startAt && endAt && startAt >= endAt) {
      throw new BadRequestException('O período informado é inválido');
    }
    return await this.repository.findHistoryByClient(clientId, startAt, endAt);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findById(id: string, userId: string, role: UserRole) {
    const appointment = await this.repository.findById(id);
    if (
      !appointment ||
      (role !== UserRole.ADMIN && appointment.clientId !== userId)
    ) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return appointment;
  }

  private async getSelectedServices(serviceIds: string[]) {
    if (new Set(serviceIds).size !== serviceIds.length) {
      throw new BadRequestException('Não repita serviços na mesma agenda');
    }
    const services = await this.repository.findActiveServicesByIds(serviceIds);
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Um ou mais serviços estão indisponíveis');
    }
    const byId = new Map(services.map((service) => [service.id, service]));
    return serviceIds.map((id) => byId.get(id) as SelectedService);
  }

  private getDayOfWeek(date: string) {
    const dayNumber = this.toInstant(date, 12, 0).getUTCDay();
    const day = DAY_BY_NUMBER[dayNumber];
    if (!day)
      throw new BadRequestException('O salão não funciona aos domingos');
    return day;
  }

  private getPeriods(
    date: string,
    businessHour: {
      openingTime: Date;
      lunchStart: Date;
      lunchEnd: Date;
      closingTime: Date;
    },
  ) {
    return [
      {
        start: this.withBusinessTime(date, businessHour.openingTime),
        end: this.withBusinessTime(date, businessHour.lunchStart),
      },
      {
        start: this.withBusinessTime(date, businessHour.lunchEnd),
        end: this.withBusinessTime(date, businessHour.closingTime),
      },
    ];
  }

  private withBusinessTime(date: string, time: Date) {
    return this.toInstant(date, time.getUTCHours(), time.getUTCMinutes());
  }

  private toInstant(date: string, hour: number, minute: number) {
    return salonDateTimeToUtc(date, hour, minute);
  }

  private assertValidDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Data inválida');
    }
    const parsed = new Date(`${date}T12:00:00.000Z`);
    if (parsed.toISOString().slice(0, 10) !== date) {
      throw new BadRequestException('Data inválida');
    }
  }

  private getHistoryPeriod(query: HistoryQueryDto) {
    if (query.startDate) this.assertValidDate(query.startDate);
    if (query.endDate) this.assertValidDate(query.endDate);

    const startAt = query.startDate
      ? salonDateTimeToUtc(query.startDate, 0, 0)
      : undefined;
    let endAt: Date | undefined;
    if (query.endDate) {
      const nextDay = new Date(`${query.endDate}T12:00:00.000Z`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      endAt = salonDateTimeToUtc(nextDay.toISOString().slice(0, 10), 0, 0);
    }
    return { startAt, endAt };
  }

  private addMinutes(value: Date, minutes: number) {
    return new Date(value.getTime() + minutes * 60 * 1000);
  }

  private pad(value: number) {
    return String(value).padStart(2, '0');
  }

  private formatDate(date: string) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
}
