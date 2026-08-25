export type WeeklyReportAppointment = {
  scheduledAt: string
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado'
  services: Array<{ price: number }>
}

export type WeeklyReport = {
  totalAppointments: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  totalServices: number
  estimatedRevenue: number
  completionRate: number
}

export function getWeekRange(referenceDate: string): { start: string; end: string }
export function moveWeek(referenceDate: string, direction: -1 | 1): string
export function calculateWeeklyReport(appointments: WeeklyReportAppointment[], referenceDate: string): WeeklyReport
