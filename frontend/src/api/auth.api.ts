import { api } from '../lib/axios'
export async function login(input: { email: string; password: string }) { const { data } = await api.post<{ access_token: string }>('/auth/login', input); return data }
export async function registerClient(input: { name: string; email: string; phone: string; password: string }) { const { data } = await api.post('/user', input); return data }
