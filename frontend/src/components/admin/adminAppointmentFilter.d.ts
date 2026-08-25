export type AdminAppointmentFilter = { search: string; startDate: string; endDate: string; status: string }
export type FilterableAdminAppointment = { id: string; customer: { name: string }; scheduledAt: string; status: string }

export function filterAdminAppointments<T extends FilterableAdminAppointment>(appointments: T[], filters: AdminAppointmentFilter): T[]
