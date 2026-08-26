export function getAppointmentById<T extends { id: string }>(appointments: T[], appointmentId: string): T | null
export function formatAppointmentCount(count: number): string
