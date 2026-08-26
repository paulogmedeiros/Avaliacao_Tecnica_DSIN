import type { AppointmentStatus } from '../client/appointmentsData'
import type { AdminAppointment } from './adminAppointmentsData'

export function updateAdminServiceStatus(appointment: AdminAppointment, serviceId: string, status: AppointmentStatus): AdminAppointment
export function cancelAdminAppointment(appointment: AdminAppointment): AdminAppointment
