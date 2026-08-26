import type { Appointment } from '../components/client/appointmentsData'
import type { AdminAppointment } from '../components/admin/adminAppointmentsData'
export function mapStatus(status: string): string
export function toApiStatus(status: string): string
export function toSalonStartAt(date: string, time: string): string
export function cleanHistoryFilters<T extends Record<string, string | undefined>>(filters: T): Partial<T>
export function formatDuration(minutes: number): string
export function mapAppointment(data: unknown): Appointment & Partial<AdminAppointment>
