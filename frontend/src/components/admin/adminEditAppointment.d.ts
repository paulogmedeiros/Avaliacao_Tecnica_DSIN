export type EditableServiceSummaryInput = { durationMinutes: number; price: number }
export function calculateAdminServiceSummary(services: EditableServiceSummaryInput[]): { durationMinutes: number; totalPrice: number }
export function formatDuration(minutes: number): string
export function buildScheduledAt(date: string, time: string): string
