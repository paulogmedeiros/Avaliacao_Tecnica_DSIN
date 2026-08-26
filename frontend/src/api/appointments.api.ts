import { api } from '../lib/axios'
import { cleanHistoryFilters } from '../lib/apiMappers.js'
export type HistoryFilters = { startDate?: string; endDate?: string }
export async function getHistory(filters: HistoryFilters = {}) { const { data } = await api.get('/appointment/history', { params: cleanHistoryFilters(filters) }); return data }
export async function getAdminAppointments() { const { data } = await api.get('/appointment/admin'); return data }
export async function getAppointment(id: string) { const { data } = await api.get(`/appointment/${id}`); return data }
export async function getAvailability(date: string, serviceIds: string[]) { const { data } = await api.get('/appointment/availability', { params: { date, serviceIds: serviceIds.join(',') } }); return data as { date: string; durationMinutes: number; suggestion: null | { date: string; appointmentId: string; message: string }; slots: Array<{ startAt: string; endAt: string }> } }
export async function createAppointment(input: { startAt: string; serviceIds: string[] }) { const { data } = await api.post('/appointment', input); return data }
export async function updateClientAppointment({ id, ...input }: { id: string; startAt?: string; serviceIds?: string[] }) { const { data } = await api.patch(`/appointment/${id}`, input); return data }
export async function cancelClientAppointment(id: string) { const { data } = await api.patch(`/appointment/${id}/cancel`); return data }
export async function updateAdminAppointment({ id, ...input }: { id: string; startAt?: string; serviceIds?: string[] }) { const { data } = await api.patch(`/appointment/admin/${id}`, input); return data }
export async function updateAppointmentStatus({ id, status }: { id: string; status: 'CONFIRMED' | 'COMPLETED' | 'CANCELED' }) { const { data } = await api.patch(`/appointment/admin/${id}/status`, { status }); return data }
export async function updateAppointmentServiceStatus(input: { appointmentId: string; appointmentServiceId: string; status: string }) { const { data } = await api.patch(`/appointment/admin/${input.appointmentId}/services/${input.appointmentServiceId}/status`, { status: input.status }); return data }
