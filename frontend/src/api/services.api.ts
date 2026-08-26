import { api } from '../lib/axios'
export type SalonService = { id: string; name: string; description?: string | null; price: number | string; durationMinutes: number; isActive: boolean }
export async function getServices() { const { data } = await api.get<SalonService[]>('/service'); return data.map((item) => ({ ...item, price: Number(item.price) })) }
export async function getAdminServices() { const { data } = await api.get<SalonService[]>('/service/admin'); return data.map((item) => ({ ...item, price: Number(item.price) })) }
export async function createAdminService(input: { name: string; description?: string; price: number; durationMinutes: number }) { const { data } = await api.post<SalonService>('/service', input); return { ...data, price: Number(data.price) } }
export async function updateAdminService({ id, ...input }: { id: string; name?: string; description?: string | null; isActive?: boolean }) { const { data } = await api.patch<SalonService>(`/service/${id}`, input); return { ...data, price: Number(data.price) } }
