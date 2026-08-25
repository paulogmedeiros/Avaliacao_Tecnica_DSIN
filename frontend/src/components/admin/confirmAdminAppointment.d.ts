type ConfirmableService = { status: string }
type ConfirmableAppointment = { status: string; services: ConfirmableService[] }

export function confirmAdminAppointment<T extends ConfirmableAppointment>(appointment: T): T
