export type AdminAppointmentAction = 'confirm' | 'edit' | 'cancel'
export function getAdminAppointmentActions(status: string): AdminAppointmentAction[]
